import ApiError from '../Utils/ApiError.js';
import jwt from 'jsonwebtoken';
import asynchandler from '../Utils/Asynchandler.js';
import User from '../Models/User.models.js';

// AIim for making this middleware when i was creating i injected my cookie on my response now any how i will extract id of my that document which i have to delete from data base and then the next thing i can't take input like eamil or such things from user for logging out ;;;
// .cookie('accesstoken', accessToken, options)
// .cookie('refreshtoken', refreshToken, options)
// In summary:

// Cookies are set in the res (response) object.
// Cookies are accessed from the req (request) object in subsequent requests.
// So, the cookie method is used to add cookies to the response (res), which the client will store and send back in the request (req).


export const verification = asynchandler(async (req, res, next) => {
    try { 
        // console.log("Middleware reached");
        // console.log("Cookies:", req.cookies); // Log cookies to debug
        const token = req.cookies?.accesstoken;
        // console.log("Access Token:", token); // Log token to debug

        if (!token) {
            res.status(500).json({
                message:"Token is not found "
            })
        }

        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      //  console.log("Decoded Token:", decodedtoken); // Log decoded token to debug


        const user = await User.findById(decodedtoken?._id).select(
            '-password -refreshToken'
        );
        // console.log("User:", user); // Log user to debug

        if (!user) {
            res.status(404).json({
                message:"Invalid Token "
            })
        }
        req.token = token;
        req.user = user;
        // console.log(req);

        next();
    } catch (error) {
        console.error("Error in middleware:", error); // Log error to debug
        res.status(404).json({
            message:"Getting stuckeed in catch block of auth middleware"
        })
    }
});
