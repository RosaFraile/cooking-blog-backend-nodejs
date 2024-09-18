import { db } from "../db.js";
import jwt from 'jsonwebtoken';
import moment from 'moment';

// Function to check if the user is authenticated and the token is correct
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

// Endpoint to add a new trick
export const addTrick = (req, res) => {
    const response = checkToken(req.cookies.access_token);

    if (response && response.status !== 200) {
        return res.status(response.status).json({error: response.message, statusCode: response.status});
    }

    const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    let published_on = null;
    if(req.body.published_on) {
        published_on = req.body.published_on
    }
                
    const q = "INSERT INTO tricks(`tricks_title`,`tricks_desc`,`tricks_users_id`,`tricks_created_at`,`tricks_published_on`,`tricks_publish_status`) VALUES(?)";
    const values = [
        req.body.title,
        req.body.desc,
        req.body.user_id,
        created_at,
        published_on,
        req.body.publish_status
    ]
    db.query(q, [values], (err,data) => {
        if (err) {
            return res.json(err);
        }

        const newID = data.insertId
            const q2 = "SELECT t.tricks_id, t.tricks_title, t.tricks_published_on, t.tricks_publish_status, u.users_username FROM tricks t JOIN users u ON u.users_id = t.tricks_users_id WHERE t.tricks_id = ?";
            
        db.query(q2, [newID], (err,data) => {
            if (err) {
                res.json(err);
            }
            return res.json(data);
        })
    })
}


// Endpoint to get all the tricks
export const getTricks = (req, res) => {
    let q;
    if(req.query.user) {
        const q = "SELECT t.tricks_id, t.tricks_title, t.tricks_desc, t.tricks_published_on, t.tricks_publish_status, u.users_username FROM tricks t JOIN users u ON u.users_id = t.tricks_users_id WHERE t.tricks_users_id = ? ORDER BY t.tricks_publish_status";
        db.query(q, [req.query.user], (err,data) => {
            if (err) {
                return res.json(err);
            }     
            return res.json(data);
        })
    } else {
        const q = "SELECT t.tricks_id, t.tricks_title, t.tricks_desc, t.tricks_published_on, t.tricks_publish_status, u.users_username FROM tricks t JOIN users u ON u.users_id = t.tricks_users_id WHERE t.tricks_publish_status='published' ORDER BY t.tricks_published_on DESC";
        db.query(q, (err,data) => {
            if (err) {
                return res.json(err);
            }     
            return res.json(data);
        })
    }
}

// Endpoint to get a trick by ID
export const getTrick = (req, res) => {
    const q =
    "SELECT t.tricks_id, t.tricks_title, t.tricks_desc, t.tricks_published_on, u.users_username FROM tricks t JOIN users u ON u.users_id = t.tricks_users_id WHERE t.tricks_id = ?";
    
    db.query(q, [req.params.id], (err,data) => {
        if (err) {
            res.json(err);
        }
        res.json(data[0]);
    })
}

// Endpoint for deleting a trick by ID
export const deleteTrick = (req, res) => {
    const response = checkToken(req.cookies.access_token);

    if (response.status !== 200) {
        return res.status(response.status).json({error: response.message, statusCode: response.status});
    }

    const q = "DELETE FROM tricks WHERE tricks_id = ?"

    db.query(q, [req.params.id], (err,data) => {
        if(err) return res.json(err);
        return res.json("Trick has been deleted");
    })
}

// Endpoint for updating a trick by ID
export const updateTrick = (req, res) => {
    const response = checkToken(req.cookies.access_token);

    if (response.status !== 200) {
        return res.status(response.status).json({error: response.message, statusCode: response.status});
    }
    
    const q = `UPDATE tricks
                SET tricks_title = "${req.body.title}",
                    tricks_desc = "${req.body.desc}",
                    tricks_published_on = "${req.body.published_on}", 
                    tricks_publish_status = "${req.body.publish_status}" 
                WHERE tricks_id=?`
    db.query(q, [[req.params.id]], (err,data) => {
        if (err) {
            return res.json(err);
        }
        
        return res.json("Trick has been updated")
    })
}