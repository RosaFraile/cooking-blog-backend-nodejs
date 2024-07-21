import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export const register = (req,res) => {
    // CHECK USER EXISTS
    const q = "SELECT * FROM users WHERE users_email='" + req.body.users_email + "' OR users_username='" + req.body.users_username + "'";

    db.query(q, (err,data) => {    
        if (err) {
            return res.json(err);
        }
        if(data.length) {
            return res.json("User already exists!");
        }

        // Hash the password and create the user

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.users_password, salt);

        const q = "INSERT INTO users(`users_username`,`users_email`,`users_password`) VALUES(?)";
        const values = [
            req.body.users_username,
            req.body.users_email,
            hash
        ]

        db.query(q, [values], (err,data) => {
            if (err) return res.json(err);
            if(data.length) return res.json(data);
            return res.json("User has been created.");
        })
    })
}

