import asynchandler from '../Utils/Asynchandler.js'
import ApiResponse from '../Utils/ApiResonse.js'
import TripModel from '../Models/Trips.model.js'
import User from '../Models/User.models.js'
import mongoose, { startSession } from 'mongoose'
import Collaboration from '../Models/Collaboration.js'
import { BlogModel } from '../Models/Blog.models.js'
import Iscollabmodel from '../Models/Iscollaborate.models.js'

const creatingnewtrip = asynchandler(async (req, res) => {
    const {
        tripName,
        destination,
        startDate,
        endDate,
        activities,
        accommodation,
        budget,
        user_id,
    } = req.body

    try {
        if (
            !tripName ||
            !destination ||
            !startDate ||
            !endDate ||
            !activities ||
            !accommodation ||
            !budget ||
            !user_id
        ) {
            return res.status(404).json({
                message: 'Make sure that you had submitted all the fields',
            })
        }
        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).json({
                message: 'User not found, please register yourself',
            })
        }

        const newTrip = new TripModel({
            tripName: tripName, //writting trp : trp is same as only left as trp
            destination,
            startDate,
            endDate,
            activities,
            accommodation,
            budget,
            user: user_id,
        })
        if (!newTrip) {
            return res.status(400).json({
                message: 'Error creating the new trips',
            })
        }
        const session = await mongoose.startSession()
        session.startTransaction()
        await newTrip.save({ session })
        user.trips.push(newTrip)
        await user.save({ session })
        await session.commitTransaction()
        return res
            .status(200)
            .json(new ApiResponse(200, newTrip, 'Trip created Successfully'))
    } catch (error) {
        console.error('Error creating trip:', error)
        return res.status(505).json({
            message: `having something wrong while creating new trips ${error}`,
        })
    }
})

const showalltrips = asynchandler(async (req, res) => {
    try {
        const trips = await TripModel.find({}).populate('user')
        if (!trips) {
            res.status(500).json({
                message: 'Having error in getting all trips ',
                status: false,
            })
        }
        res.status(200).json(
            new ApiResponse(200, trips, 'Getting all trips successfully')
        )
    } catch (error) {
        res.status(500).json({
            message: `Having error in getting all trips ${error}`,
            status: false,
        })
    }
})

const deletetrips = asynchandler(async (req, res) => {
    console.log('etting in delete section ')
    const { id } = req.params
    await TripModel.findByIdAndDelete(id)
    res.status(200).json(new ApiResponse(200, 'Deletd your trip succesfullly '))
})

const usertrips = asynchandler(async (req, res) => {
    try {
        const { id } = req.params
        console.log(`id which is coming in usertrips ${id}`)

        const usertripss = await User.findById(id).populate('trips')
        console.log('getting usertrips')
        console.log(usertripss)

        if (!usertripss) {
            console.log('not getting usertrips')
            return res.status(404).json({
                message: 'Having error in getting user trips',
                status: false,
            })
        }

        res.status(200).json(
            new ApiResponse(200, usertripss, 'Getting user data successfully')
        )
    } catch (error) {
        console.log(`${error} errororoongenn`)
        res.status(500).json({
            message: `Having error in getting user trips ${error}`,
            status: false,
        })
    }
})

const ratinghandler = asynchandler(async (req, res) => {
    const { rate, id } = req.body
    if (!rate || !id) {
        return res.status(404).json({
            message:
                'Having error in getting rating trips, givw id as well as rating',
            status: false,
        })
    }
    const trip = await TripModel.findById(id).populate('user')
    if (!trip) {
        return res.status(404).json({
            message: 'Trip was not founded on the basis of id',
            status: false,
        })
    }
    const session = await mongoose.startSession()
    session.startTransaction()
    trip.rating.push(rate)
    await trip.save({ session })
    await session.commitTransaction()

    res.status(200).json(new ApiResponse(200, trip, 'Rating updated'))
})

const collaboratehandler = asynchandler(async (req, res) => {
    try {
        const { follower_userid, following_userid } = req.body

        if (!follower_userid || !following_userid) {
            return res.status(400).json({
                status: 'false',
                message: 'Please send all fields properly',
            })
        }

        let collab = new Collaboration({
            pendingrequest: false,
            follower_userid,
            following_userid,
        })
        await collab.save()

        collab = await Collaboration.findById(collab._id)
            .populate('following_userid')
            .populate('follower_userid')
            .exec()

        // console.log(collab)

        res.status(200).json({
            status: 'true',
            data: collab,
            message: 'New collab created successfully',
        })
    } catch (error) {
        return res.status(500).json({
            status: 'false',
            message: `Error in creating collaboration request controller: ${error}`,
        })
    }
})

const iscollab = asynchandler(async (req, res) => {
    try {
        const { following_userid, trip_id } = req.body
        if (!trip_id || !following_userid) {
            return res.status(400).json({
                status: 'false',
                message: 'Please send all fields properly',
            })
        }

        const existingCollaboration = await Iscollabmodel.findOne({
            following_userid,
            trip_id,
        })

        if (existingCollaboration) {
            return res.status(400).json({ message: 'Already collaborated' })
        }

        const collaboration = new Iscollabmodel({ following_userid, trip_id })
        await collaboration.save()

        res.status(201).json({
            message: 'Collaboration created',
            collaboration,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error', error })
    }
})

const notificationhandler = asynchandler(async (req, res) => {
    const { requester_id } = req.params
    if (!requester_id) {
        return res.status(400).json({
            status: 'false',
            message: 'Please send all fields properly',
        })
    }
    const userrequests = await Collaboration.find({
        follower_userid: requester_id,
    }).populate('following_userid')

    if (!userrequests) {
        return res.status(500).json({
            status: 'false',
            message: 'Having error in getting user Requests',
        })
    }
    res.status(200).json(
        new ApiResponse(
            200,
            userrequests,
            'Getting user Notifications successfully'
        )
    )
})

const confirmpendingrequest = asynchandler(async (req, res) => {
    try {
        const { following_userid, follower_userid } = req.body
        if (!following_userid || !follower_userid) {
            return res.status(400).json({
                status: 'false',
                message: 'Please send all fields properly',
            })
        }

        let collab = await Collaboration.findOne({
            $and: [{ following_userid }, { follower_userid }],
        })
            .populate('following_userid')
            .populate('follower_userid')
            .exec()

        if (!collab) {
            return res.status(404).json({
                status: 'false',
                message: 'Collaboration request not found',
            })
        }
        console.log('First coolab', collab)
        collab.pendingrequest = true
        console.log('Second coolab', collab)
        collab = await collab.save()

        res.status(200).json(
            new ApiResponse(
                200,
                collab,
                'Collaboration request updated successfully'
            )
        )
    } catch (error) {
        return res.status(404).json({
            status: 'false',
            message: `Having Error in resolving request error ${error}`,
        })
    }
})

const deletecollabrequest = asynchandler(async (req, res) => {
    let { collabdocid } = req.body
    if (!collabdocid) {
        return res.status(404).json({
            status: 'false',
            message: 'Give id to delete collaboration',
        })
    }

    await Collaboration.findByIdAndDelete(collabdocid)

    res.status(200).json(
        new ApiResponse(200, 'Deleted collab request successfully')
    )
})

const dashboardinfo = asynchandler(async (req, res) => {
    let { loggedinuser_id } = req.body
    if (!loggedinuser_id) {
        return res.status(404).json({
            status: 'false',
            message: 'Give id to update dashboardinfo',
        })
    }
    const followingcount = await Collaboration.countDocuments({
        following_userid: loggedinuser_id,
    })

    const followercount = await Collaboration.countDocuments({
        follower_userid: loggedinuser_id,
        pendingrequest: true,
    })
    const notifications = await Collaboration.countDocuments({
        follower_userid: loggedinuser_id,
        pendingrequest: false,
    })
    if (!followercount && followercount < 0) {
        return res.status(404).json({
            status: 'false',
            message: `Not having number of follower  ${followercount}`,
        })
    }
    if (!followingcount && followingcount < 0) {
        return res.status(404).json({
            status: 'false',
            message: `Not having number of follower  ${followingcount} `,
        })
    }
    const blogcounts = await BlogModel.countDocuments({
        user: loggedinuser_id,
    })
    const triplength = await TripModel.countDocuments({
        user: loggedinuser_id,
    })
    const dashboarddata = {
        followingcount: followingcount,
        followercount: followercount,
        triplength: triplength,
        blogcounts: blogcounts,
        notifications: notifications,
    }
    if (!dashboarddata) {
        return res.status(404).json({
            status: 'false',
            message: 'GNot having dashboarddata ',
        })
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                dashboarddata,
                'Getting user dashboard successfully'
            )
        )
})

const showfollowers = asynchandler(async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(404).json({
                status: 'false',
                message: 'Give id to update dashboardinfo',
            })
        }
        const followerdocs = await Collaboration.find({
            follower_userid: id,
            pendingrequest: true,
        }).populate('following_userid')
        if (!followerdocs) {
            return res.status(404).json({
                status: 'false',
                message: 'follower data not found',
            })
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, followerdocs, 'Data getting successfully')
            )
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            status: 'false',
            message: `Having some error ${error}`,
        })
    }
})

const showfollowing = asynchandler(async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(404).json({
                status: 'false',
                message: 'Give id to update dashboardinfo',
            })
        }
        const followingdocs = await Collaboration.find({
            following_userid: id,
            pendingrequest: true || false,
        }).populate('follower_userid')
        if (!followingdocs) {
            return res.status(404).json({
                status: 'false',
                message: 'follower data not found',
            })
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, followingdocs, 'Data getting successfully')
            )
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            status: 'false',
            message: `Having some error ${error}`,
        })
    }
})
export {
    creatingnewtrip,
    showalltrips,
    deletetrips,
    usertrips,
    ratinghandler,
    collaboratehandler,
    notificationhandler,
    confirmpendingrequest,
    deletecollabrequest,
    dashboardinfo,
    showfollowers,
    showfollowing,
    iscollab
}
