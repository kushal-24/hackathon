import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router= Router();
import { upload } from "../middlewares/multer.middleware.js";
import { 
    adminLogin, 
    adminLogout, 
    adminReg, 
    changeAdminPassword, 
    changePfp, 
    getAdminDetails, 
    refreshAccessToken, 
    updateAdminDetails } 
    from "../constrollers/admin.controller.js";

router.route("/register").post(
    upload.fields([
        {
            name: "pfp",
            maxCount: 1,
        },
        {},
    ]),
    adminReg);
    router.route("/login").post(adminLogin);
    router.route("/logout").post(verifyJWT(["admin"]),adminLogout);
    router.route("/changepassword").patch(verifyJWT(["admin"]),changeAdminPassword);
    router.route("/adminprofile").get(verifyJWT(["admin"]), getAdminDetails);
    router.route("/updateaccount").patch(verifyJWT(["admin"]), updateAdminDetails);
    router.route("/updatepfp").patch(verifyJWT(["admin"]),upload.single("pfp"),changePfp);
    router.route("/refreshtoken").post(refreshAccessToken);

    export default router;