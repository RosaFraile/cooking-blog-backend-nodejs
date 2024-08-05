import express from "express";

import { getUserRecipes } from "../controllers/userRecipe.js";

const router = express.Router();

router.get("/", getUserRecipes);

export default router;