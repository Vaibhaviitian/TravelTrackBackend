import mongoose, { mongo } from "mongoose";
const tripSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        tripName : {
            type:String,
            required : [true,'trip name is must']
        },
        destination : {
            type:String,
            required : [true,'destination is must']
        },
        startDate : {
            type:String,
            required : [true,'startdate is must']
        },
        endDate : {
            type:String,
            required : [true,'endDate is must']
        },
        activities : {
            type:String,
            required : [true,'Activities is must']
        },
        accommodation : {
            type:String,
            required : [true,'accommodation is must']
        },
        rating:[{
            type:Number
        }]
    },
    {
        timestamps: true
    }
)

const TripModel = mongoose.model('Trip',tripSchema);
export default TripModel