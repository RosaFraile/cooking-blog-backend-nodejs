import { db } from "../db.js";

// Endpoint to get the tricks from a user
export const getUserTricks = (req, res) => {
    if(req.query.option === "all") {
        const q = "SELECT t.tricks_id, t.tricks_title, t.tricks_desc, u.users_username FROM tricks t JOIN users u ON u.users_id = t.tricks_users_id WHERE t.tricks_users_id = ? ORDER BY t.tricks_published_on DESC";
        db.query(q, [req.query.user], (err,data) => {
            if (err) {
                console.log(err);
                return res.json(err);
            }
            console.log(data);
            return res.json(data);
        })
    } else {
        const q = `SELECT t.tricks_id, t.tricks_title, t.tricks_desc, u.users_username FROM tricks t JOIN users u ON u.users_id = t.tricks_users_id WHERE t.tricks_publish_status="${req.query.option}" AND t.tricks_users_id = ? ORDER BY t.tricks_published_on DESC`;
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