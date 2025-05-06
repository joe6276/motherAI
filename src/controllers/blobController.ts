import { Request, Response } from "express";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import mssql from 'mssql'
import { sqlConfig } from "../Config";

const connectionString = ""
const containerName = "";


interface UploadFile extends Express.Multer.File {}
export async function addFile(req:Request, res:Response){
    try {
        const {CompanyId,Department}= req.body
        const file = req.file as UploadFile; // Typecasting file
        if (!file) {
          return res.status(400).send("No file uploaded.");
        }
    
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists({ access: "blob" });
    
        const blobName = `${uuidv4()}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: { blobContentType: file.mimetype },
        });
        
            const pool = await mssql.connect(sqlConfig)
                 await pool.request()
                .input("CompanyId", CompanyId)
                .input("Department", Department)
                // .input("CompanyId", 2)
                // .input("Department", "Finance")
                .input("DocumentURL", blockBlobClient.url)
                .execute("addDocument")
               

        return res.status(200).json({ imageUrl: blockBlobClient.url });
      } catch (error:any) {
        console.error("Upload failed:", error.message);
        return res.status(500).send("Upload failed.");
      }
    
}