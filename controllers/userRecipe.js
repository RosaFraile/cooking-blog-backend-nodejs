import { db } from "../db.js";

// Endpoint to get the recipes from a user
export const getUserRecipes = (req, res) => {
    if(req.query.option === "all") {
        const q = `SELECT r.recipes_id, r.recipes_title, r.recipes_desc, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, u.users_username FROM recipes r JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_users_id = ? ORDER BY r.recipes_published_on DESC`;
        db.query(q, [req.query.user], (err,data) => {
            if (err) {
                console.log(err);
                return res.json(err);
            }
            console.log(data);
            return res.json(data);
        })
    } else {
        const q = `SELECT r.recipes_id, r.recipes_title, r.recipes_desc, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, u.users_username FROM recipes r JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_publish_status="${req.query.option}" AND r.recipes_users_id = ? ORDER BY r.recipes_published_on DESC`;
        db.query(q, [req.query.user], (err,data) => {
            if (err) {
                console.log(err);
                return res.json(err);
            }
            console.log(data);
            return res.json(data);
        })
    }
}