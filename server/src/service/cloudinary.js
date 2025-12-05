import { v2 as cloudinary } from "cloudinary";
import { unlinkSync } from "fs";
import { CLOUD_API_KEY, CLOUD_API_SECRET, CLOUD_NAME } from "../constant.js";
// Configuration
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});
const cloudinaryUpload = async (imgPath, folder, public_id) => {
  try {
    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(imgPath, {
        folder,
        public_id,
      })
      .catch((error) => {
        console.log(error);
      });

    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url(uploadResult.public_id, {
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
    });
    unlinkSync(imgPath);
    return { uploadResult, optimizeUrl, autoCropUrl };
  } catch (error) {
    unlinkSync(imgPath);
    throw error;
  }
};

const cloudinaryDelete = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw error;
  } finally {
    return true;
  }
};

export { cloudinaryUpload, cloudinaryDelete };