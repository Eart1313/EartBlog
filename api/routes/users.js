import express from "express";
import { addPost } from "../controller/post.js";

const userRouter = express.Router();

userRouter.get("/", addPost);

export default userRouter;
