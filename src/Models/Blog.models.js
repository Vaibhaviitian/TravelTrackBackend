import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required and necessary'],
        },
        message: {
            type: String,
            required: [true, 'Message is required and necessary'],
        },
        photo: {
            type: String
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        laf:{
            type:Boolean,
            required:[true]        
        }
    },
    { timestamps: true }
);

export const BlogModel = mongoose.model('Blog', BlogSchema);
