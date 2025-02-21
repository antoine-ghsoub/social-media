import express from "express";
import { getUser, updateUser, searchUsers } from "../controllers/user.js";

const router = express.Router();

router.get("/find/:userId", getUser);
router.put("/", updateUser);
router.get("/search", searchUsers);

export default router;
