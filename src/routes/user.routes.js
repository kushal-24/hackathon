import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { changeUserPassword, getUserDetails, registerUser, updateUserDetails, userLogin, userLogout } from "../constrollers/user.controller.js";
import { refreshAccessToken } from "../constrollers/user.controller.js";

const router= Router()

router.route("/register").post(upload.none(),registerUser)
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJWT(["user"]) ,userLogout);
router.route("/changepassword").post(verifyJWT(["user"]) ,changeUserPassword);
router.route("/userprofile").get(verifyJWT(["user"]) ,getUserDetails);
router.route("/updateaccount").patch(verifyJWT(["user"]) ,updateUserDetails);
router.route("/refreshtoken").post(refreshAccessToken);

export default router;