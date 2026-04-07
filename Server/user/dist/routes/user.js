import express from "express";
import { getAllUsers, getAUser, loginUser, myProfile, updateName, updateProfilePic, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import { acceptConnectionRequest, getIncomingRequests, getUserByEmail, sendConnectionRequest, rejectConnectionRequest, unfriendUser } from "../controllers/request.js";
const router = express.Router();
router.post("/login", loginUser);
router.post("/signup", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, myProfile);
router.put("/user/update", isAuth, updateName);
router.put("/user/update/profile-pic", isAuth, upload.single("profilePic"), updateProfilePic);
router.get("/user/all", isAuth, getAllUsers);
// Request API endpoints (must come before /user/:id to prevent matching 'requests', 'email', 'request/send' etc to :id)
router.post("/user/email", isAuth, getUserByEmail);
router.post("/user/request/send", isAuth, sendConnectionRequest);
router.get("/user/requests", isAuth, getIncomingRequests);
router.post("/user/request/accept", isAuth, acceptConnectionRequest);
router.post("/user/request/reject", isAuth, rejectConnectionRequest);
router.delete("/user/unfriend", isAuth, unfriendUser);
// Parameterized static routes should go last 
router.get("/user/:id", getAUser);
export default router;
