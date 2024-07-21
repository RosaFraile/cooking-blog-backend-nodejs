import express from "express";

import { getRecipes } from "../controllers/recipe.js";
import { getCatRecipes } from "../controllers/recipe.js"
import { getRecipe } from "../controllers/recipe.js";
import { addRecipe } from "../controllers/recipe.js";
import { deleteRecipe } from "../controllers/recipe.js";
import { updateRecipe } from "../controllers/recipe.js";

const router = express.Router();

router.get("/test", (req, res) => {
    res.json("This is recipes")
})
router.get("/", getRecipes)
router.get("/", getCatRecipes)
router.get("/:id", getRecipe)
router.post("/", addRecipe)
router.delete("/:id", deleteRecipe)
router.put("/:id", updateRecipe)

export default router;