import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../core/lib/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "uploads",
    public_id: Date.now() + "-" + file.originalname,
  }),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
        file.mimetype,
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  },
});

export default upload;
