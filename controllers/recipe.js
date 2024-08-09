import { db } from "../db.js";
import jwt from 'jsonwebtoken';
import fs from 'fs';

/*
    - Endpoint to get:
        - All the published recipes
        - The recipes by user
        - The recipes by category
    - Endpoint to get a recipe by ID
    - Endpoint for deleting a recipe by ID
    - Endpoint for deleting a recipe image
*/

// Endpoint to get all the recipes
export const getRecipes = (req, res) => {
    console.log("Current user:", req.query.user);
    let q;
    if(req.query.user) {
        q = `SELECT r.recipes_id, r.recipes_title, r.recipes_ingredients, r.recipes_directions, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_published_on, r.recipes_publish_status, r.recipes_users_id, c.categories_name, u.users_username FROM recipes r JOIN categories c ON c.categories_id = r.recipes_categories_id JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_users_id=${req.query.user} ORDER BY r.recipes_created_at DESC`;
    } else if(req.query.cat) {
        console.log("Paso por aqui CATEGORIES")
        q = `SELECT r.recipes_id, r.recipes_title, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_published_on, r.recipes_users_id, u.users_username FROM recipes r JOIN categories c ON c.categories_id = r.recipes_categories_id JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_publish_status='published' AND c.categories_name='${req.query.cat}' ORDER BY r.recipes_published_on DESC`;
    } else {
        q = "SELECT r.recipes_id, r.recipes_title, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_published_on, r.recipes_users_id, r.recipes_users_id, u.users_username FROM recipes r JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_publish_status='published' ORDER BY r.recipes_published_on DESC";
    }
    
    db.query(q, (err,data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        
        return res.json(data);
    })
}

// Endpoint to get a recipe by ID
export const getRecipe = (req, res) => {
    const q =
    "SELECT r.recipes_id, r.recipes_title, r.recipes_ingredients, r.recipes_directions, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_published_on, r.recipes_publish_status, r.recipes_users_id, c.categories_name, u.users_username FROM recipes r JOIN categories c ON c.categories_id = r.recipes_categories_id JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_id = ?";
    
    db.query(q, [req.params.id], (err,data) => {
        if (err) {
            res.json(err);
        }
        return res.json(data);
    })
}

// Endpoint for deleting a recipe by ID
export const deleteRecipe = (req, res) => {
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }
    })

    const q = "SELECT recipes_img_url FROM recipes WHERE recipes_id = ?"
    
    db.query(q, [req.params.id], (err,data) => {
        if(err) return res.json(err);
        
        fs.unlink(`./public/images/${data[0].recipes_img_url}`, (err) => {
            if (err) {
                return res.json("An error ocurred when deleting the recipe image")
            }
            const q1 = "DELETE FROM recipes WHERE recipes_id = ?"

            db.query(q1, [req.params.id], (err,data) => {
                if(err) return res.json(err);
                return res.json("Recipe has been deleted");
            })
        })
    })
}

// Endpoint for deleting a recipe image by its name
export const deleteRecipeImage = (req, res) => {
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }
    })

    console.log("Image name", req.params.id)

    fs.unlink(`./public/images/${req.params.id}`, (err) => {
        if (err) {
            return res.json("An error ocurred when deleting the recipe image")
        }
        return res.json("Image was delete successfully")
    })
}