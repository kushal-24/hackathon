import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createNewEvent, deleteCoverImg, deleteEvent, deleteLogo, editEventDetails, getAllEvents, getEventDetails, updateCoverImg, updateLogo } from "../constrollers/adminEvent.controller.js";

const router = Router();

router.route("/createevent").post(
    upload.fields([
        {
            name: "coverImg",
            maxCount: 1,
        },
        {
            name: "logo",
            maxCount: 1,
        }
    ]), verifyJWT(["admin"]), createNewEvent)
router.route("/updatecoverimg/:eventTitle").patch(
    upload.fields([
        {
            name: "coverImg",
            maxCount: 1,
        }
    ])
    , verifyJWT(["admin"]), updateCoverImg)

    router.route("/updatelogo/:eventTitle").patch(
    upload.fields([
        {
            name: "logo",
            maxCount: 1,
        }
    ]), verifyJWT(["admin"]), updateLogo)
router.route("/deleteevent/:eventTitle").delete(verifyJWT(["admin"]), deleteEvent)
router.route("/geteventdetails/:eventTitle").get(verifyJWT(["admin"]), getEventDetails)
router.route("/editeventdetails/:eventname").patch(verifyJWT(["admin"]), editEventDetails)
router.route("/getallevents").get(verifyJWT(["admin"]), getAllEvents)
router.route("/deletelogo/:eventTitle").delete(verifyJWT(["admin"]), deleteLogo)
router.route("/deletecoverimg/:eventTitle").delete(verifyJWT(["admin"]), deleteCoverImg)

export default router;