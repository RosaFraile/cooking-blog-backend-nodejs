import { db } from "../db.js";
import jwt from 'jsonwebtoken';

// Funciton to check if the user is authenticated and the token is valid
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

// Endpoint to add a new category
export const addCategory = (req, res) => {
    const response = checkToken(req.cookies.access_token);

    if (response && response.status !== 200) {
        return res.status(response.status).json({error: response.message, statusCode: response.status});
    }
                
    const q = "INSERT INTO categories(`categories_name`) VALUES(?)";

    db.query(q, [req.body.name], (err,data) => {
        if (err) {
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
    const response = checkToken(req.cookies.access_token);

    if (response && response.status !== 200) {
        return res.status(`${response.status}`).json({error: response.message, statusCode: response.status});
    }

    const q = "DELETE FROM categories WHERE categories_id = ?"

    db.query(q, [req.params.id], (err,data) => {
        if(err) return res.json(err);
        return res.json("Category has been deleted");
    })
}

// Endpoint for updating a category by ID
export const updateCategory = (req, res) => {
    const response = checkToken(req.cookies.access_token);

    if (response && response.status !== 200) {
        return res.status(`${response.status}`).json({error: response.message, statusCode: response.status});
    }
    
    if(!req.body.name) {
        return res.status(400).json({error: "Category name undefined", statusCode: 400});
    }

    const q = `UPDATE categories
            SET categories_name = "${req.body.name}"    
            WHERE categories_id=?`

    db.query(q, [[req.params.id]], (err,data) => {
        if (err) {
            return res.json(err);
        }
        return res.json("Category has been updated")
    })
}