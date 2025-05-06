
import { Router } from "express";
import { addFile } from "../controllers/blobController";
import multer from "multer";


const storage = multer.memoryStorage();
const upload = multer({ storage });



 const uploadRouter= Router()

 uploadRouter.post("/upload", upload.single("image"), addFile);


export default uploadRouter