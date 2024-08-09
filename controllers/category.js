import { db } from "../db.js";
import jwt from 'jsonwebtoken';

// Endpoint to add a new category
export const addCategory = (req, res) => {
   // console.log(req.body);
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }
    })
                
    const q = "INSERT INTO categories(`categories_name`) VALUES(?)";

    db.query(q, [req.body.name], (err,data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        return res.json("Category has been created")
    })
}


// Endpoint to get all the categories
export const getCategories = (req, res) => {
    const q = "SELECT * FROM categories ORDER BY categories_id";
    db.query(q, (err,data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }     
        return res.json(data);
    })
}

// Endpoint to get a category by ID
export const getCategory = (req, res) => {
    const q =
    "SELECT * FROM categories WHERE categories_id = ?";
    
    db.query(q, [req.params.id], (err,data) => {
        if (err) {
            res.json(err);
        }
        res.json(data[0]);
    })
}

// Endpoint for deleting a category by ID
export const deleteCategory = (req, res) => {
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }
    })

    const q = "DELETE FROM categories WHERE categories_id = ?"

    db.query(q, [req.params.id], (err,data) => {
        if(err) return res.json(err);
        return res.json("Category has been deleted");
    })
}

// Endpoint for updating a category by ID
export const updateCategory = (req, res) => {
    res.json("From controller");
}