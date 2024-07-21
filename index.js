import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

import authRoutes from "./routes/auth.js";
/*
import recipeRoutes from "./routes/recipes.js";
import trickRoutes from "./routes/tricks.js";
*/

const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: true,
    credentials: true,
};

app.use(cors(corsOptions));

app.use("/auth", authRoutes)
/*
app.use("/recipes", recipeRoutes)
app.use("/tricks", trickRoutes)
*/

app.listen(5000, () => {
    console.log("Connected");
})
