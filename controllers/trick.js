import { db } from "../db.js";
import jwt from 'jsonwebtoken';
import moment from 'moment';

// Endpoint to add a new trick
export const addTrick = (req, res) => {
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
            console.log(err);
            return res.json(err);
        }
        return res.json("Trick has been created")
    })
}


// Endpoint to get all the tricks
export const getTricks = (req, res) => {
    const q = "SELECT t.tricks_id, t.tricks_title, t.tricks_desc, u.users_username FROM tricks t JOIN users u ON u.users_id = t.tricks_users_id WHERE t.tricks_publish_status='published' ORDER BY t.tricks_published_on DESC";
    db.query(q, (err,data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }     
        return res.json(data);
    })
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
    const token = req.cookies.access_token;
    
    if(!token) {
        return res.json("401") // Not authenticated
    }
    jwt.verify(token,"jwtkey", (err, userInfo) => {
        if (err) {
           return res.json("403") // Token in not valid
        }
    })

    const q = "DELETE FROM tricks WHERE tricks_id = ?"

    db.query(q, [req.params.id], (err,data) => {
        if(err) return res.json(err);
        return res.json("Trick has been deleted");
    })
}

// Endpoint for updating a trick by ID
export const updateTrick = (req, res) => {
    res.json("From controller");
}