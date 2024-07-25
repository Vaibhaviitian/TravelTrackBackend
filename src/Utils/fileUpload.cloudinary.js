import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

const uploadOnCloudinary = async (lfp)=>{
    try {
        if(!lfp) return null;
        const response = await cloudinary.uploader.upload(lfp, {
            resource_type: "auto"
        })
        console.log(response);
        console.log("File was uploaded successfully",response.url);
        // fs.unlinkSync(lfp); 
        // If you will keep this above statement then you are not able to save your file in local diresctory
        return response;
    } catch (error) {
        fs.unlinkSync(lfp);
        console.error('Fetching file is unsuccessfull',error);
    }
}


export default uploadOnCloudinary;