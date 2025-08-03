import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    /**
    S1--> took arrgument as userID and fetched user with the help of it
    S2-->stored accessandrefreshtoken with the help of fucntion we wrote before 
    S3-->save it in the field of refrehsToken and return both the tokens
     */
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(500, "user not found");
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(404, `tokens werent generated, error occured: ${error}`)
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const { fullName, email, password, mobileNo } = req.body;

    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "all details are required")
    }

    /** The function field?.trim() === "": 
        Makes sure that even " " (spaces only) is treated as empty
        The ?. ensures it doesn't crash if the field is undefined
        Basically If any of the important fields (fullName, email, password) are missing or just 
        blank spaces — then stop the registration and show an error."
    */

    const existedUser = await User.findOne({
        $or: [{ email }, { mobileNo }]
    })
    const existedAdmin = await Admin.findOne({ email })

    if (existedUser || existedAdmin) {
        throw new apiError(400, "user already exists pls login");
    }

    const user = await User.create({
        fullName,
        email,
        mobileNo,
        password,
        role: "user",
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(201)
        .json(
            new apiResponse(
                201,
                createdUser,
                "User created successfully"
            )
        )
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorised request brother");//token hi sahi nai hai 
    }

    console.log(incomingRefreshToken)

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new apiError(401, "no user found or some changes made");//user hi nai hai 
    }

    if (incomingRefreshToken != user?.refreshToken) {
        throw new apiError(401, "no user found or some changes made");//user hi nai hai 
    }

    const options = {
        httpOnly: true,
        secure: false
    }

    
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    user.refreshToken = newRefreshToken;

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                { accessToken, newRefreshToken },
                "Access token is refreshed"
            )
        )
})



////////////////////////////////LOGINNNNN/////
const userLogin = asyncHandler(async (req, res, next) => {
    /**
    S1-->request email from the user through req.body
    S2-->findOne(email) else udhar hi error
    S3--> use ifPassword correct function to check password
    S4-->if correct, extract complete user profile using findbyId
    S5-->generate TOKENS ALWAYS while logins
    S6-->write conditions of http true for cookies and
    S7-->return apiResponse plus cookies also res.cookie("accessToken", accessToken, options)
     */
    const { email, password } = req.body;
    if (!(email)) {
        throw new apiError(400, "Fill in the details first")
    }
    const user = await User.findOne({ email })

    if (!user) {
        throw new apiError(404, "No user registered found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(400, "go away, wrong password, no more chances")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false,
        /** Preventing hackers from reading it via browser scripts (httpOnly)
            Ensuring it’s only sent over secure connections (secure) ✅ */
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken, refreshToken
                },
                "LOGGED IN"
            )
        )
})

/**        LOGOUTT///////////////////////////////////////
S1--> find user by id(verifyJWT) and update method 
S2-->unset operator and new: true to be set
S3-->cookies to be cleared using clearCookie */
const userLogout = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
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
        .json(new apiResponse(200, {}, "logged out User "))

})

const changeUserPassword = asyncHandler(async (req, res, next) => {
    /* 1. req for username or email and password, new password
       2. if user wrong, error
       3. if pasword wrong, error
       4. new password =this.password */
    const { email, password, newPassword, confirmNewPassword } = req.body;
    if (!(email)) {
        throw new apiError(400, "no email and username entered!");
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new apiError(400, "no user found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new apiError(401, "wrong password lil bro");
    }

    if (!(newPassword === confirmNewPassword)) {
        throw new apiError(400, "passwords dont match ");
    }

    user.password = confirmNewPassword;
    await user.save({ validateBeforeSave: false });

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
const getUserDetails = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new apiError(500, "server error hogaya");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "User details fetched successfully"
            )
        )
})
const updateUserDetails = asyncHandler(async (req, res, next) => {
    const { email, mobileNo } = req.body;

    const user = await User.findOneAndUpdate({ _id: req.user?._id },
        {
            $set: { mobileNo: mobileNo, }
        },
        {
            new: true,
            runValidators: true, // validate schema on update
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new apiError(400, "No such admin exists");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "user details are updated successfully"
            )
        )
})


export {
    generateAccessAndRefreshToken,
    registerUser,
    userLogin,
    updateUserDetails,
    getUserDetails,
    changeUserPassword,
    userLogout,
    refreshAccessToken
}