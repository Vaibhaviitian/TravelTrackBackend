import asynchandler from '../Utils/Asynchandler.js'
import User from '../Models/User.models.js'
import ApiError from '../Utils/ApiError.js'
import ApiResponse from '../Utils/ApiResonse.js'
import uploadOnCloudinary from '../Utils/fileUpload.cloudinary.js'
import otpgenerator from 'otp-generator'
import twilio from 'twilio'
import OTPmodel from '../Models/Otp.model.js'

const options = {
    httpOnly: true,
    secure: true,
}

const generateAccessAndRefereshTokens = async (id) => {
    try {
        const user = await User.findById(id)
        // console.log('User found for token generation:', user)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        // console.log('Generated Access Token:', accessToken)
        // console.log('Generated Refresh Token:', refreshToken)

        return { accessToken, refreshToken }
    } catch (error) {
        // console.error('Error during token generation:', error)
        throw new ApiError(
            500,
            'Something went wrong while creating Access and Referesh Tokens'
        )
    }
}

const registeruser = asynchandler(async (req, res) => {
    const { email, fullName, avatar, coverImage, password, username } = req.body
    // console.log(username, email, fullName, password)
    if (
        [username, email, fullName, avatar, password, coverImage].some(
            (fields) => fields?.trim() === ''
        )
    ) {
        return res.status(404).json({ message: 'Please give all the inputs' })
    }

    const alreadyuser = await User.findOne({
        $or: [{ email }, { username }],
    })
    if (alreadyuser) {
        return res.status(404).json({
            message: 'User already exists,Please check your email or username',
        })
    }
    // req.files generally used for your middlewares

    const avatarfilepath = req.files?.avatar[0].path
    const coverfilepath = req.files?.coverImage[0].path
    if (!avatarfilepath) {
        return res.status(404).json({ message: 'Avatar is required' })
    }
    if (!coverfilepath) {
        return res.status(404).json({ message: 'coverimage is required' })
    }

    const avataris = await uploadOnCloudinary(avatarfilepath)
    const coveris = await uploadOnCloudinary(coverfilepath)
    if (!avataris && !coveris) {
        return res.status(500).json({
            message:
                'Error is in uploading your avatar files or coverImage files , we will cover it shortly',
        })
    }

    const user = await User.create({
        fullName,
        avatar: avataris.url,
        email,
        password,
        username: username.toLowerCase(),
        coverImage: coveris.url,
    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )
    if (!createdUser) {
        return res
            .status(500)
            .json({ message: 'Error while registring the user' })
    }
    // console.log('Register User done successfully')
    return res.status(200).json({
        statuscode: 200,
        loggedInUser: createdUser,
        message: 'User registered Successfully',
        success: 'true',
    })
})

const loginuser = asynchandler(async (req, res) => {
    const { username, email, password } = req.body
    const user = await User.findOne({
        $or: [{ username }, { email }],
    })
    if (!user) {
        return res
            .status(400)
            .json({ message: 'User not found. Please register.' })
    }
    const isPassCorrect = await user.isPassCorrect(password)
    if (!isPassCorrect) {
        return res.status(400).json({ message: 'Invalid credentials' })
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    )
    // console.log('Access Token:', accessToken)
    // console.log('Refresh Token:', refreshToken)
    const loggedInUser = await User.findById(user._id).select(' -refreshToken')
    // console.log('Cookie is going to adding')
    return res
        .status(200)
        .cookie('accesstoken', accessToken, options)
        .cookie('refreshtoken', refreshToken, options)
        .json({
            statuscode: 200,
            loggedInUser: loggedInUser,
            accessToken: accessToken,
            message: 'User logged in Successfully',
            success: 'true',
        })
})

const logoutuser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: undefined, // this removes the field from document
            },
        },
        {
            new: true,
        }
    )

    return res
        .status(200)
        .clearCookie('accesstoken', options)
        .clearCookie('refreshtoken', options)
        .json(new ApiResponse(200, {}, 'User logged out successfully'))
})

const editusername = asynchandler(async (req, res) => {
    const { username, id } = req.body

    if (!username) {
        return res.status(400).json({
            message: 'Please provide a new username',
        })
    }
    const existingUser = await User.findOne({ username })
    // console.log('existingUser' + existingUser)
    if (existingUser) {
        return res.status(409).json({
            message: 'Username already exists. Please choose a different one.',
        })
    }
    const loggedInUser = await User.findByIdAndUpdate(
        id,
        {
            $set: {
                username: username, // this removes the field from document
            },
        },
        {
            new: true,
        }
    )

    if (!loggedInUser) {
        return res.status(500).json({
            message: 'Server having some issue',
        })
    }

    res.status(200).json({
        statuscode: 200,
        loggedInUser: loggedInUser,
        message: 'Username edited successfully',
        success: 'true',
    })
})

const editemail = asynchandler(async (req, res) => {
    const { email, id } = req.body

    if (!email) {
        return res.status(400).json({
            message: 'Please provide your email',
        })
    }
    if (!id) {
        return res.status(400).json({
            message: 'Not having parameter for searching',
        })
    }
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(409).json({
            message: 'Email already exists. Please choose a different one.',
        })
    }
    const loggedInUser = await User.findByIdAndUpdate(
        id,
        {
            $set: {
                email: email,
            },
        },
        {
            new: true,
        }
    )
    if (!loggedInUser) {
        return res.status(500).json({
            message: 'Server having some issue',
        })
    }

    res.status(200).json({
        statuscode: 200,
        loggedInUser: loggedInUser,
        message: 'email edited successfully',
        success: 'true',
    })
})

const editFullname = asynchandler(async (req, res) => {
    const { fullName, id } = req.body

    if (!fullName) {
        return res.status(400).json({
            message: 'Please provide your fullName',
        })
    }
    if (!id) {
        return res.status(400).json({
            message: 'Not having parameter for searching',
        })
    }
    const existingUser = await User.findOne({ fullName })
    if (existingUser) {
        return res.status(409).json({
            message: 'fullName already exists. Please choose a different one.',
        })
    }
    const loggedInUser = await User.findByIdAndUpdate(
        id,
        {
            $set: {
                fullName: fullName,
            },
        },
        {
            new: true,
        }
    )
    if (!loggedInUser) {
        return res.status(500).json({
            message: 'Server having some issue',
        })
    }

    res.status(200).json({
        statuscode: 200,
        loggedInUser: loggedInUser,
        message: 'fullname edited Successfully',
        success: 'true',
    })
})

const feeedback = asynchandler(async (req, res) => {
    try {
        const { id, feedback } = req.body
        if (!id) {
            return res.status(400).json({
                message: 'You have to Login  first to give feedback',
            })
        }
        const user = await User.findById(id)
        if (!user) {
            return res.status(400).json({
                message: 'User not registered here ',
            })
        }
        user.feedback = feedback
        await user.save()
        return res
            .status(200)
            .json(new ApiResponse(200, user, 'Feedback added succesfully'))
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'Having error in feedback',
        })
    }
})

const totaluser = asynchandler(async (req, res) => {
    try {
        const count = await User.countDocuments()
        console.log(count)
        if (!count) {
            res.status(500).json({
                message: `NOt getting user try again later`,
                status: `False`,
            })
        }

        res.status(200).json(
            new ApiResponse(200, count, 'Total user fetched successfully')
        )
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: `${error}`,
            status: `False`,
        })
    }
})

const generateandsetOTP = asynchandler(async (req, res) => {
    try {
        const { phonenumber } = req.body
        const twilio_bhai = new twilio(
            process.env.Account_SID,
            process.env.Auth_Token
        )

        const otp = otpgenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets: false , specialChars: false });
        const stringWithoutSpaces = phonenumber.replace(/\s+/g, '')
        if (stringWithoutSpaces.length !== 13) {
            return res.status(400).json({
                message: 'Give valid phone number',
                success: 'False',
            })
        }
        await OTPmodel.findOneAndUpdate(
            { phonenumber: stringWithoutSpaces },
            { otp, otpexpiry: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        await twilio_bhai.messages.create({
            body: `Your OTP from TravelTrack is ${otp}. Verify your account to become an agent. Don't share your credentials.`,
            to: phonenumber,
            from: process.env.My_Twilio_phone_number,
        })

        res.status(200).json(
            new ApiResponse(
                200,
                `OTP sent successfully to your ${phonenumber}`,
                'OTP sent'
            )
        )
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: `${error}`,
            success: 'False',
        })
    }
})

const checkingotp = asynchandler(async (req, res) => {
    try {
        const { phonenumber, otp, id } = req.body

        if (!otp || !id) {
            return res.status(400).json({
                message: 'Please provide both otp and id.',
            })
        }

        const otpdoc = await OTPmodel.findOne({ phonenumber })

        if (!otpdoc) {
            return res.status(400).json({
                message: 'Register your mobile again',
            })
        }

        if (otpdoc.otp !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP.',
                ans: 'false',
            })
        }

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                ans: 'false',
            })
        }

        user.isverified = true
        await user.save()

        res.status(200).json({
            message: 'User verified successfully.',
            ans: 'true',
        })
    } catch (error) {
        console.error('Error in checking OTP:', error)
        return res.status(400).json({
            message: `Having error in checking the OTP: ${error.message}`,
            ans: 'false',
        })
    }
})

const isagent = asynchandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({
            message: 'Please provide an id.',
        });
    }

    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({
            message: 'User not found.',
        });
    }

    const isverified = user.isverified;

    if (!isverified) {
        return res.status(200).json(
            new ApiResponse(200, false, 'User is not verified.')
        );
    }

    res.status(200).json(
        new ApiResponse(200, isverified, 'User is verified.')
    );
});

export {
    registeruser,
    loginuser,
    logoutuser,
    editusername,
    editemail,
    editFullname,
    feeedback,
    totaluser,
    generateandsetOTP,
    checkingotp,
    isagent
}
