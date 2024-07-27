import { db } from "../db.js";


export const getRecipes = (req, res) => {
    const q = "SELECT r.recipes_id, r.recipes_title, r.recipes_desc, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, u.users_username FROM recipes r JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_publish_status='published' ORDER BY r.recipes_published_on";
    db.query(q, (err,data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        
        return res.json(data);
    })
}

export const getCatRecipes = (req, res) => {
    res.json("From controller");
}

export const getRecipe = (req, res) => {
    console.log("Recipe ID",req.params.id)
    
    const q =
    "SELECT r.recipes_id, r.recipes_title, r.recipes_desc, r.recipes_prep_time, r.recipes_servings, r.recipes_img_url, r.recipes_published_on, u.users_username FROM recipes r JOIN users u ON u.users_id = r.recipes_users_id WHERE r.recipes_id = ?";
    
    db.query(q, [req.params.id], (err,data) => {
        if (err) {
            console.log("Paso por aqui error", err)
            res.json(err);
        }
        console.log(data);
//        return res.json("OK")
//        return res.json(data)
        const q2 = "SELECT * FROM ingredients WHERE ingredients_recipes_id = ?"
        db.query(q2, [req.params.id], (err,data1) => {
            if (err) res.json(err);
            console.log(data1);

            const q3 = "SELECT * FROM steps WHERE steps_recipes_id = ?"
            db.query(q3, [req.params.id], (err,data2) => {
                if (err) res.json(err);
                console.log(data2);

                const recipe = {
                    "id": data[0].recipes_id,
                    "title": data[0].recipes_title,
                    "desc": data[0].recipes_desc,
                    "prep_time": data[0].recipes_prep_time,
                    "servings": data[0].recipes_servings,
                    "img_url": data[0].recipes_img_url,
                    "published_on": data[0].recipes_published_on,
                    "users_username": data[0].users_username,
                    "ingredients": data1,
                    "steps": data2
                }
                return res.json(recipe)
            })
        })
    })
}

/*
export const addRecipe = (req, res) => {
    console.log("File", req.file)
    console.log("Body", req.body)
    console.log("Cookies", req.cookies)
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    

    return "OK"

    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }

        const q1 = "SELECT categories_id FROM categories WHERE categories_name = ?";
        db.query(q1, [req.body.categories_name], (err,data) => {
            if(err) return res.json(err);
    
            const q = "INSERT INTO posts(posts_title, posts_desc, posts_img, posts_categories_id, posts_date, posts_users_id, posts_publish) VALUES (?)";

            const values = [
                req.body.posts_title,
                req.body.posts_desc,
                req.body.posts_img,
                data[0].categories_id,
                req.body.posts_date,
                userInfo.id,
                req.body.posts_publish
            //    userInfo.id
            ]

            db.query(q, [values], (err,data) => {
                if(err) return res.json(err);
                return res.json("Post has been created");
            })
        })
    });
}
*/
export const deleteRecipe = (req, res) => {
    res.json("From controller");
}

export const updateRecipe = (req, res) => {
    res.json("From controller");
}