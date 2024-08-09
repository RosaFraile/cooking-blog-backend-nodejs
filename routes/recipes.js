import express from "express";

import { 
    getRecipes,
    getRecipe,
    deleteRecipe,
    deleteRecipeImage
 } from "../controllers/recipe.js";


const router = express.Router();

router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.delete("/:id", deleteRecipe);
router.delete("/delete-recipe-image/:id", deleteRecipeImage);

export default router;