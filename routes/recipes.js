import express from "express";

import { getRecipes } from "../controllers/recipe.js";
//import { getCatRecipes } from "../controllers/recipe.js"
import { getRecipe } from "../controllers/recipe.js";
import { deleteRecipe } from "../controllers/recipe.js";
import { updateRecipe } from "../controllers/recipe.js";

const router = express.Router();

router.get("/", getRecipes);
//router.get("?cat=:cat", getCatRecipes);
router.get("/:id", getRecipe);
router.delete("/:id", deleteRecipe);
router.put("/:id", updateRecipe);

export default router;