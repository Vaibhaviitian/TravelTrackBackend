import { Router } from 'express'
import {
    collaboratehandler,
    confirmpendingrequest,
    creatingnewtrip,
    dashboardinfo,
    deletecollabrequest,
    deletetrips,
    iscollab,
    notificationhandler,
    ratinghandler,
    recommendationoftrips,
    showalltrips,
    showfollowers,
    showfollowing,
    usertrips,
} from '../Controllers/Trips.controller.js'

const Triprouter = Router()

Triprouter.route('/creatingnewtrips/').post(creatingnewtrip)
Triprouter.route('/gettingalltrips').get(showalltrips)
Triprouter.route('/deletingtripbyid/:id').delete(deletetrips)
Triprouter.route('/usertripsbyid/:id').get(usertrips)
Triprouter.route('/ratingsupdateandsubmission').post(ratinghandler)
Triprouter.route('/createcollaborationrequest').post(collaboratehandler)
Triprouter.route('/iscollab').post(iscollab);
Triprouter.route('/gettingnotificationsbyid/:requester_id').get(notificationhandler)
Triprouter.route('/requesthandling').post(confirmpendingrequest);
Triprouter.route('/deletecollabrequest').post(deletecollabrequest);
Triprouter.route('/gettingdashboardinfo').post(dashboardinfo)
Triprouter.route('/dashboard-details/collaborators').post(showfollowers);
Triprouter.route('/dashboard-details/followings').post(showfollowing);
Triprouter.route('/recommendation-of-Trips').get(recommendationoftrips);

export default Triprouter
