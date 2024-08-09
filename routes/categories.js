import express from "express";

import { addCategory } from "../controllers/category.js";
import { getCategories } from "../controllers/category.js";
import { getCategory } from "../controllers/category.js";
import { deleteCategory } from "../controllers/category.js";
import { updateCategory } from "../controllers/category.js";

const router = express.Router();

router.post("/", addCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.delete("/:id", deleteCategory);
router.put("/:id", updateCategory);

export default router;