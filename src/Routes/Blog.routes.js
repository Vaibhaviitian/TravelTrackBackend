import { Router } from "express";
import { ShowAllBlogs ,creatingBlogs,UpdatingBlogs,GetoneBlog, DeleteBlog,userblogs} from "../Controllers/Bloghandling.controller.js";
import upload from "../Middlewares/multer.js";
const blogrouter = Router();

blogrouter.route('/communityinside-done/show-all-blogs').get(ShowAllBlogs);

blogrouter.route('/communityinside-done/creating-new-blog').post(
    upload.fields([
        {
            name:"photo",
            maxCount:1
        }
    ]),
    creatingBlogs);

blogrouter.route('/communityinside-done/updating-blog/:id').put(UpdatingBlogs);

blogrouter.route('/communityinside-done/get-blog/:id').get(GetoneBlog);

blogrouter.route('/communityinside-done/delete-blog/:id').delete(DeleteBlog);

blogrouter.route('/communityinside-done/user-blogs/:id').get(userblogs);

export default blogrouter;
