import { db } from "./db.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import multer from "multer";
import moment from "moment";
import path from "path";

import authRoutes from "./routes/auth.js";
import recipeRoutes from "./routes/recipes.js";
/*
import trickRoutes from "./routes/tricks.js";
*/

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
    const file = req.file;
    if (!file) {
        const error = new Error("Please upload a file");
        error.httpStatusCode = 400;
        return next(error);
    }

    const q1 = "SELECT categories_id FROM categories WHERE categories_name = ?";

    db.query(q1, [req.body.cat_name], (err,data) => {
        console.log("Paso por aqui 1");
        if (err) return res.json(err);
        if(data.length === 0) return res.json("404"); // Category not found
        
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        let published_on = null;
        if(req.body.published_on) {
            published_on = req.body.published_on
        }
        const q2 = "INSERT INTO recipes(`recipes_title`,`recipes_desc`,`recipes_prep_time`, `recipes_servings`, `recipes_img_url`, `recipes_categories_id`, `recipes_users_id`, `recipes_created_at`,`recipes_published_on`, `recipes_publish_status`) VALUES(?)";
        const values = [
            req.body.title,
            req.body.desc,
            req.body.prep_time,
            req.body.servings,
            file.filename,
            data[0].categories_id,
            req.body.user_id,
            created_at,
            published_on,
            req.body.publish_status
        ]
        db.query(q2, [values], (err,data) => {
            if (err) {
                console.log(err);
                return res.json(err);
            }
            
            for (let idx in req.body.ingredients) {
                let q3 = "INSERT INTO ingredients(`ingredients_desc`,`ingredients_recipes_id`) VALUES(?)";
                let ingredValues = [
                    req.body.ingredients[idx],
                    data.insertId
                ]
                db.query(q3, [ingredValues], (err,data) => {
                    if (err) {
                        console.log("Ingredientes error", err);
                        return res.json(err);
                    }
                })
            }
            for (let idx in req.body.steps) {
                let q4 = "INSERT INTO steps(`steps_desc`,`steps_recipes_id`) VALUES(?)";
                let stepsValues = [
                    req.body.steps[idx],
                    data.insertId
                ]
                db.query(q4, [stepsValues], (err,data) => {
                    if (err) {
                        console.log("Steps error", err);
                        return res.json(err);
                    }
                })
            }
        })
        return res.json("Recipe has been created");
    });
})

app.use("/auth", authRoutes)
app.use("/recipes", recipeRoutes)
/*
app.use("/tricks", trickRoutes)
*/

app.listen(5000, () => {
    console.log("Connected");
})
