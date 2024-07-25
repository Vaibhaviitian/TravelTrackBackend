import mongoose from 'mongoose'

const collaborationSchema = new mongoose.Schema(
    {
        following_userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        follower_userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        pendingrequest: {
            type: String,
            required: true,
        },
    },
    { 
        timestamps: true 
    }
)

const Collaboration = mongoose.model('Collaboration', collaborationSchema)

export default Collaboration
