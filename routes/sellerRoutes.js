import express from "express"
import { register, profile, confirmation, authenticate, lostPassword, checkToken, newPassword} from "../controllers/sellerController.js"
import checkAuth from "../middleware/authMiddleware.js"
const router = express.Router()

//Public
router.post('/',register)
router.get("/confirmar/:token",confirmation)
router.post("/login",authenticate)
router.post("/lost-password",lostPassword)
router.route("/lost-password/:token").get(checkToken).post(newPassword)

//Private
router.get('/perfil',checkAuth,profile)
export default router 