import express from "express";

import { getUserTricks } from "../controllers/userTrick.js";

const router = express.Router();

router.get("/", getUserTricks);

export default router;