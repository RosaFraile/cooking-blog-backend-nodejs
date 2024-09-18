import { db } from "./db.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import multer from "multer";
import moment from "moment";
import path from "path";
import jwt from 'jsonwebtoken';

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import recipeRoutes from "./routes/recipes.js";
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

//Función para comprobar que el usuario está loggeado y que el token es válido
const checkToken = token => {
    if(!token) {
        return {status: 401, message: "User not authenticated"};
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
            return {status: 403, message: "Token is not valid"};
        }
        return {status: 200, message: "OK"};
    })
}

// Configurar multer para almacenar imagenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+ file.originalname)
    }
})
const upload = multer({ storage: storage })

/*
    - Endpoint to add a new recipe
    - Endpoint to update a recipe by ID
*/

////////////////// Endpoint to add a new recipe ///////////////////////
app.post('/recipes', upload.single('file'), function (req, res, next) {
    const response = checkToken(req.cookies.access_token);

    if (response && response.status !== 200) {
        return res.status(`${response.status}`).json({error: response.message, statusCode: response.status});
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({error: "Please, upload a file", statusCode: 400});
    }

    const q1 = "SELECT categories_id FROM categories WHERE categories_name = ?";

    db.query(q1, [req.body.cat_name], (err,data) => {
        if (err) return res.json(err);
        if(data.length === 0) {
            return res.status(404).json({error: "Category not found", statusCode: 404});
        }
        
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        let published_on = moment("1970-01-01").format('YYYY-MM-DD HH:mm:ss');
        if(req.body.published_on) {
            published_on = req.body.published_on
        }
        const q2 = "INSERT INTO recipes(`recipes_title`,`recipes_ingredients`,`recipes_directions`,`recipes_prep_time`, `recipes_servings`, `recipes_img_url`, `recipes_difficulty`, `recipes_created_at`,`recipes_published_on`,`recipes_publish_status`,`recipes_categories_id`, `recipes_users_id`) VALUES(?)";
        const values = [
            req.body.title,
            req.body.ingredients,
            req.body.directions,
            req.body.prep_time,
            req.body.servings,
            file.filename,
            req.body.difficulty,
            created_at,
            published_on,
            req.body.publish_status,
            data[0].categories_id,
            req.body.user_id  
        ]
        db.query(q2, [values], (err,data) => {
            if (err) {
                return res.json(err);
            }
            const newID = data.insertId
            const q3 = "SELECT r.recipes_id, r.recipes_title, r.recipes_ingredients, r.recipes_directions, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_difficulty, r.recipes_published_on, r.recipes_publish_status, c.categories_name, u.users_username FROM recipes r JOIN categories c ON c.categories_id = r.recipes_categories_id JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_id = ?";
            
            db.query(q3, [newID], (err,data) => {
                if (err) {
                    res.json(err);
                }
                return res.json(data);
            })
        })
    });
})

///////////////// Endpoint to update a recipe by ID ////////////////////
app.patch('/recipes/:id', upload.single('file'), function (req, res, next) {
    const response = checkToken(req.cookies.access_token);

    if (response && response.status !== 200) {
        return res.status(`${response.status}`).json({error: response.message, statusCode: response.status});
    }

    let img_url;
    if (req.file) {
        img_url = req.file.filename;
    } else if (req.body.img_url) {
        img_url = req.body.img_url;
    } else {
        return res.status(400).json({error: "Please, upload a file", statusCode: 400});
    }

    const q1 = "SELECT categories_id FROM categories WHERE categories_name = ?";

    db.query(q1, [req.body.cat_name], (err,data) => {
        if (err) return res.json(err);

        if(data.length === 0) {
            return res.status(404).json({error: "Category not found", statusCode: 404});
        }

        const category_id = data[0].categories_id;

        const q = `UPDATE recipes
                    SET recipes_title = "${req.body.title}",
                        recipes_ingredients = "${req.body.ingredients}",
                        recipes_directions = "${req.body.directions}",
                        recipes_prep_time = "${req.body.prep_time}",
                        recipes_servings = ${req.body.servings},
                        recipes_img_url = "${img_url}",
                        recipes_difficulty = "${req.body.difficulty}",
                        recipes_published_on = "${req.body.published_on}", 
                        recipes_publish_status = "${req.body.publish_status}",
                        recipes_categories_id = ${category_id} 
                    WHERE recipes_id=?`
        db.query(q, [req.body.id], (err,data) => {
            if (err) {
                return res.json(err);
            }

            const q2 = "SELECT r.recipes_id, r.recipes_title, r.recipes_ingredients, r.recipes_directions, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_published_on, r.recipes_publish_status, r.recipes_users_id, c.categories_name, u.users_username FROM recipes r JOIN categories c ON c.categories_id = r.recipes_categories_id JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_id = ?";
            
            db.query(q2, [req.body.id], (err,data) => {
                if (err) {
                    return res.json(err);
                }
                return res.json(data)
            })
        })
    })
})

app.use("/auth", authRoutes)
app.use("/categories", categoryRoutes)
app.use("/recipes", recipeRoutes)
app.use("/tricks", trickRoutes)

app.listen(5000, () => {
    console.log("Connected");
})
