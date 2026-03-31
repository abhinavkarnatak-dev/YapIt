import express from "express";
import { getAllUsers, getAUser, loginUser, myProfile, updateName, updateProfilePic, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/login", loginUser);

router.post("/verify", verifyUser);

router.get("/me", isAuth, myProfile);

router.put("/user/update", isAuth, updateName);

router.put("/user/update/profile-pic", isAuth, upload.single("profilePic"), updateProfilePic);

router.get("/user/all", isAuth, getAllUsers);

router.get("/user/:id", getAUser);


export default router;