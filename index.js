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
            const newID = data.insertId
            const q3 = "SELECT r.recipes_id, r.recipes_title, r.recipes_ingredients, r.recipes_directions, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_published_on, c.categories_name, u.users_username FROM recipes r JOIN categories c ON c.categories_id = r.recipes_categories_id JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_id = ?";
            
            db.query(q3, [newID], (err,data) => {
                if (err) {
                    res.json(err);
                }
                console.log("New recipe", data)
                return res.json(data);
            })
        })
    });
})

///////////////// Endpoint to update a recipe by ID ////////////////////
app.patch('/recipes/:id', upload.single('file'), function (req, res, next) {
    console.log("ID of the recipe to update", req.body.id)
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }
    })

    let img_url;
    if (req.file) {
        img_url = req.file.filename;
    } else if (req.body.img_url) {
        img_url = req.body.img_url;
    } else {
        return res.json("Please, load an image!!!")
    }

    const q1 = "SELECT categories_id FROM categories WHERE categories_name = ?";

    db.query(q1, [req.body.cat_name], (err,data) => {
        if (err) return res.json(err);
        if(data.length === 0) return res.json("404"); // Category not found

        const category_id = data[0].categories_id;

        const q = `UPDATE recipes
                    SET recipes_title = "${req.body.title}",
                        recipes_ingredients = "${req.body.ingredients}",
                        recipes_directions = "${req.body.directions}",
                        recipes_prep_time = "${req.body.prep_time}",
                        recipes_servings = ${req.body.servings},
                        recipes_img_url = "${img_url}",
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
                console.log("Respuesta DB", data)
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
