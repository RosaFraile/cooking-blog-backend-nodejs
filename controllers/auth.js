import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export const register = (req,res) => {
    // CHECK USER EXISTS
    const q = `SELECT * FROM users WHERE users_email="${req.body.email}" OR users_username="${req.body.username}"`;

    db.query(q, (err,data) => {    
        if (err) {
            return res.json(err);
        }
        if(data.length) {
            return res.status(409).json({error: "Username or email already exists", statusCode: 409})
        }

        // Hash the password and create the user

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const q = "INSERT INTO users(`users_username`,`users_email`,`users_password`) VALUES(?)";
        const values = [
            req.body.username,
            req.body.email,
            hash
        ]

        db.query(q, [values], (err, data) => {
            if (err) return res.json(err);
            return res.status(200).json("User has been created successfully");
        })
    })
}

export const login = (req,res) => {
    // CHECK USER EXISTS
    const q = "SELECT * FROM users WHERE users_username = ?";

    db.query(q, [req.body.username], (err,data) => {
        if (err) return res.json(err);
        if(data.length === 0) {
            return res.status(404).json({error: "Username not found", statusCode: 404});
        }

        // Check password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].users_password);
        if(!isPasswordCorrect) {
            return res.status(400).json({error: "Password is incorrect", statusCode: 400});
        }

        const token = jwt.sign({id:data[0].users_id}, "jwtkey");
        const { users_password, ...other } = data[0];

        return res.cookie("access_token", token, {
            httpOnly:true,
        }).json(other);
    })
}

export const logout = (req,res) => {
    return res.clearCookie("access_token").json("User has been logged out");
}