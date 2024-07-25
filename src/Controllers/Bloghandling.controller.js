import { BlogModel } from '../Models/Blog.models.js'
import asynchandler from '../Utils/Asynchandler.js'
import ApiResponse from '../Utils/ApiResonse.js'
import User from '../Models/User.models.js'
import mongoose from 'mongoose'
import uploadOnCloudinary from '../Utils/fileUpload.cloudinary.js'

const ShowAllBlogs = asynchandler(async (req, res) => {
    try {
        const blogs = await BlogModel.find({}).populate('user')
        if (blogs.length === 0) {
            return res.status(400).json({
                message: 'No blogs are found',
            });
        }
        res.status(200).json({
            status: 200,
            state: true,
            Blogs: blogs,
            message: `We have total ${blogs.length} Blogs`,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'Having Error in Showing all blogs: ' + error,
        })
    }
})

const creatingBlogs = asynchandler(async (req, res) => {
    try {
        const { title, message, user_id, lost } = req.body
        // console.log(title);
        // console.log(message)
        // console.log('User id is coming as ' + user_id)

        if (!title || !message || !user_id) {
            return res.status(400).json({
                message: 'Please provide all fields for creating blogs',
            })
        }

        const photofilepath = req.files?.photo?.[0]?.path
        let isphoto = null

        if (photofilepath) {
            // console.log('User provided an image while creating the blog')
            isphoto = await uploadOnCloudinary(photofilepath)
            if (!isphoto) {
                return res.status(500).json({
                    message:
                        'Having problem uploading the photo of the blog to Cloudinary',
                })
            }
        } else {
            console.log('User did not provide an image while creating the blog')
        }

        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).json({
                message: 'User not found, please register yourself',
            })
        }

        const newBlog = new BlogModel({
            title,
            message,
            photo: isphoto?.url || 'Not having image',
            user: user_id,
            laf: lost,
        })

        const session = await mongoose.startSession()
        session.startTransaction()
        await newBlog.save({ session })
        user.blogs.push(newBlog)
        await user.save({ session })
        await session.commitTransaction()

        if (!newBlog) {
            return res.status(400).json({
                message: 'Error creating the new blog',
            })
        }

        // console.log(user)
        return res
            .status(201)
            .json(
                new ApiResponse(200, newBlog, 'New Blog created successfully')
            )
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Error creating new blogs: ' + error,
        })
    }
})

const UpdatingBlogs = asynchandler(async (req, res) => {
    try {
        const { id } = req.params
        const { title, message, photo } = req.body
        const blog = await BlogModel.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true }
        )
        if (!blog) {
            console.log('Having issue in blog updating')
            return res.status(404).json({
                message: 'Not getting blogs ',
            })
        }

        res.status(200).json(
            new ApiResponse(200, blog, 'Updated blog successfully')
        )
    } catch (error) {
        console.log('having error in catch part of updating blogs ' + error)
        return res.status(404).json({
            message: 'having error in catch part of updating blogs ' + error,
        })
    }
})

const GetoneBlog = asynchandler(async (req, res) => {
    const { id } = req.params
    const blog = await BlogModel.findById(id)
    if (!blog) {
        return res.status(400).json({
            message: 'Having invalid id',
        })
    }
    res.status(200).json(
        new ApiResponse(200, blog, 'This is your individual blog')
    )
})

const DeleteBlog = asynchandler(async (req, res) => {
    try {
        const { id } = req.params
        console.log('Id in delete ' + id)
        await BlogModel.findByIdAndDelete(id)
        return res
            .status(200)
            .json(new ApiResponse(200, {}, 'Deleted successfully'))
    } catch (error) {
        return res.status(404).json({
            message: 'Having invalid id' + error,
        })
    }
})
const userblogs = asynchandler(async (req, res) => {
    try {
        const { id } = req.params
        const userblogs = await User.findById(id).populate('blogs')
        // console.log(userblogs)
        if (!userblogs) {
            return res.status(400).json({
                message: 'User not have any blogs  ',
            })
        }
        res.status(200).json(
            new ApiResponse(200, userblogs, 'User have these blogs')
        )
    } catch (error) {
        return res.status(404).json({
            message:
                'Having error while fetching user blogs using user id ' + error,
        })
    }
})



export {
    ShowAllBlogs,
    creatingBlogs,
    UpdatingBlogs,
    GetoneBlog,
    DeleteBlog,
    userblogs,
}
