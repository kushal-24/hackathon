import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js";
import {Admin} from "../models/admin.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            throw new apiError(404, "admin not found");
        }

        const accessToken = await admin.generateAccessToken();
        const refreshToken = await admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(404, "generation of tokens failed :( ")
    }
}
const adminReg = asyncHandler(async (req, res, next) => {
    const { fullName, email, username, password, age, dob } = req.body;
    //for extracting details in form data

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "invalid details brotha")
    }

    const existedAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    })
    if (existedAdmin) {
        throw new apiError(404, "This Admin already exists, pls login instead");
    }

    const pfpLocalPath = req.files?.pfp?.[0]?.path;

    if (!pfpLocalPath) {
        throw new apiError(400, "no pfp found");
    }

    const pfp = await uploadOnCloudinary(pfpLocalPath)

    if (!pfp) {
        throw new apiError(404, "it wasnt uploaded")
    }

    const admin = await Admin.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        pfp: pfp.url,
        age,
        dob,
        role: "admin",
    })

    const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

    if (!createdAdmin) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, createdAdmin, "User registered successfully")
        )
})

////////////////////////////////LOGINNNNN/////
const adminLogin = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!(username) && !(email)) {
        throw new apiError(400, "Fill in the details first")
    }
    const admin = await Admin.findOne({
        $or: [{ username }, { email }]
    })

    if (!admin) {
        throw new apiError(404, "No user registered found");
    }

    const isPasswordValid = await admin.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(400, "go away, wrong password, no more chances")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(admin._id)

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    admin: loggedInAdmin,
                    accessToken, refreshToken
                },
                "LOGGED IN"
            )
        )
})

//LOGOUTT///////////////////////////////////////
const adminLogout = asyncHandler(async (req, res, next) => {
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $unset: {
                refreshToken: "",

            }
        },
        {
            new: true//to return the new document
        }
    )
    const options = {
        httpOnly: true,
        secure: false,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "logged out bro "))

})

const changeAdminPassword = asyncHandler(async (req, res, next) => {
    /**
     1. req for username or email and password, new password
     2. if user wrong, error
     3. if pasword wrong, error
     4. new password =this.password
     */

    const { username, email, password, newPassword, confirmNewPassword } = req.body;
    if(!(username)&&!(email)){
        throw new apiError(400, "no email and username entered!");
    }
    
    const admin = await Admin.findOne({
        $or: [{ username }, { email }]
    })
    if(!admin){
        throw new apiError(400, "no user found");
    }

    const isPasswordCorrect= await admin.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new apiError(401, "wrong password lil bro");
    }

    if(!(newPassword===confirmNewPassword)){
        throw new apiError(400, "passwords dont match ");
    }

    admin.password= confirmNewPassword;
    await admin.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "Password has been updated successfully yeahhyeahhh"
        )
    )

})
const getAdminDetails= asyncHandler(async(req,res,next)=>{
    const adminId= req.admin?._id;
    const admin= await Admin.findById(adminId).select("-password -refreshToken");
    if(!admin){
        throw new apiError(500, "server error hogaya");
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            admin,
            "Admin details fetched successfully"
        )
    )
})
const updateAdminDetails= asyncHandler(async(req,res,next)=>{
    const {username, email, dob, age}= req.body;
    
    const admin= await Admin.findOneAndUpdate({_id:req.admin?._id},
        {
            $set: {
                username: username,
                email: email,
                dob: dob,
                age: age,
            }
        },
        {
            new: true, 
            runValidators: true, // ✅ validate schema on update
        }
    ).select("-password -refreshToken");

    if(!admin){
        throw new apiError(400, "No such admin exists");
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            admin,
            "admin details are updated successfully"
        )
    )
})
const changePfp= asyncHandler(async(req,res,next)=>{
    const pfpLocalPath= req.file?.path
    if(!pfpLocalPath){
        throw new apiError(400,"no pfp acquired")
    }
    const pfp= await uploadOnCloudinary(pfpLocalPath);
    if(!pfp){
        throw new apiError(400,"sorry, couldnt upload it bro :(")
    }

    const admin= await Admin.findByIdAndUpdate({_id: req.admin?._id},
        {
            $set: {
                pfp: pfp.url
            }
        },
        {
            new: true,
            runValidators: false,
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            admin,
            "pfp updates successfullyy"
        )
    )
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorised request brother");//token hi sahi nai hai 
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const admin = await Admin.findById(decodedToken?._id);

        if (!admin) {
            throw new apiError(401, "no user found or some changes made");//user hi nai hai 
        }

        if (incomingRefreshToken !== admin?.refreshToken) {
            throw new apiError(401, "no user found or some changes made");//user hi nai hai 
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newrefreshToken } = generateAccessAndRefreshToken(admin._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken, newrefreshToken },
                    "Access token is refreshed"
                )
            )
    } catch (error) {
        throw new apiError(400, error?.message || "invalid refresh token")
    }
})


export { 
    adminReg, 
    adminLogin, 
    generateAccessAndRefreshToken, 
    adminLogout, 
    changeAdminPassword, 
    getAdminDetails, 
    updateAdminDetails, 
    changePfp,
    refreshAccessToken }
//in ADMIN: 
/**
--> Admin register- admin controller  
-->Admin login- admin controller  
-->Admin logout- admin controller +authorisationadmin middleware  
-->Admin update details- admin controller + authorisationadmin middleware  
-->Admin change password- admin controller + authorisationadmin middleware  
-->Admin create an event- eventcreatecontroller + authorisationadmin middleware
-->Edit/Delete Events- eventcreatecontroller + authorisationadmin middleware
-->Admin reply to comments- querycontroller + authorisation middleware
-->Admin to view registrations- regcontroller + authorisationadmin middleware
-->export reg- regcontroller + authorisationadmin middleware
-->
 */
