import { Router } from 'express'
import {
    loginuser,
    logoutuser,
    registeruser,
    editusername,
    editemail,
    editFullname,
    feeedback,
    totaluser,
} from '../Controllers/usernew.controller.js'
import upload from '../Middlewares/multer.js'
import { verification } from '../Middlewares/authorization.mw.js'
const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1,
        },
        {
            name: 'coverImage',
            maxCount: 1,
        },
    ]),
    registeruser
)

router.route('/logout').post(verification, logoutuser)
router.route('/editedTo/username').post(editusername)
router.route('/editedTo/email').post(editemail)
router.route('/editedTo/fullName').post(editFullname)
router.route('/sending-feedback').post(feeedback)
router.route('/getting-totaluser').get(totaluser)

router.route('/login').post(loginuser)
console.log('Done setting up routes')

export default router
