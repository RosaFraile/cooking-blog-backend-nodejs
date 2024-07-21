import express from "express";

import { getTricks } from "../controllers/trick.js";
import { getTrick } from "../controllers/trick.js";
import { addTrick } from "../controllers/trick.js";
import { deleteTrick } from "../controllers/trick.js";
import { updateTrick } from "../controllers/trick.js";


const router = express.Router();

router.get("/", getTricks)
router.get("/:id", getTrick)
router.post("/", addTrick)
router.delete("/:id", deleteTrick)
router.put("/:id", updateTrick)

export default router;