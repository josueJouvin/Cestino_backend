import express from "express";
import {
  register,
  profile,
  confirmation,
  authenticate,
  lostPassword,
  checkToken,
  newPassword,
  updateProfile,
  updatePassword
} from "../controllers/sellerController.js";
import checkAuth from "../middleware/authMiddleware.js";
const router = express.Router();

//Public
router.post("/", register);
router.get("/confirmar/:token", confirmation);
router.post("/login", authenticate);
router.post("/lost-password", lostPassword);
router.route("/lost-password/:token").get(checkToken).post(newPassword);

//Private
router.get("/profile", checkAuth, profile);
router.put("/profile/:id", checkAuth, updateProfile)
router.put("/update-password", checkAuth, updatePassword)
export default router;