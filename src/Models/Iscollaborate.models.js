import mongoose from 'mongoose'

const iscollabschema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        trip_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const Iscollabmodel = mongoose.model('iscollab', iscollabschema)

export default Iscollabmodel
