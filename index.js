import { db } from "./db.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import multer from "multer";
import moment from "moment";
import path from "path";
import jwt from 'jsonwebtoken';

import authRoutes from "./routes/auth.js";
import recipeRoutes from "./routes/recipes.js";
import userRecipesRoutes from "./routes/userRecipes.js"
import userTricksRoutes from "./routes/userTricks.js"
import trickRoutes from "./routes/tricks.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: true,
    credentials: true,
};

app.use(cors(corsOptions));

// Configurar Express para servir archivos estáticos
app.use('/images', express.static(path.join('public/images')));

// Add a new recipe
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+ file.originalname)
    }
})
const upload = multer({ storage: storage })

app.post('/recipes', upload.single('file'), function (req, res, next) {
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }
    })

    const file = req.file;
    if (!file) {
        const error = new Error("Please upload a file");
        error.httpStatusCode = 400;
        return next(error);
    }

    console.log(req.body);
    console.log(req.file);

    const q1 = "SELECT categories_id FROM categories WHERE categories_name = ?";

    db.query(q1, [req.body.cat_name], (err,data) => {
        if (err) return res.json(err);
        if(data.length === 0) return res.json("404"); // Category not found
        
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        let published_on = null;
        if(req.body.published_on) {
            published_on = req.body.published_on
        }
        const q2 = "INSERT INTO recipes(`recipes_title`,`recipes_ingredients`,`recipes_directions`,`recipes_prep_time`, `recipes_servings`, `recipes_img_url`, `recipes_created_at`,`recipes_published_on`,`recipes_publish_status`,`recipes_categories_id`, `recipes_users_id`) VALUES(?)";
        const values = [
            req.body.title,
            req.body.ingredients,
            req.body.directions,
            req.body.prep_time,
            req.body.servings,
            file.filename,
            created_at,
            published_on,
            req.body.publish_status,
            data[0].categories_id,
            req.body.user_id  
        ]
        db.query(q2, [values], (err,data) => {
            if (err) {
                console.log(err);
                return res.json(err);
            }
            return res.json("Recipe has been created");
        })
    });
})

app.use("/auth", authRoutes)
app.use("/recipes", recipeRoutes)
app.use("/tricks", trickRoutes)
app.use("/userRecipes", userRecipesRoutes)
app.use("/userTricks", userTricksRoutes)

app.listen(5000, () => {
    console.log("Connected");
})
