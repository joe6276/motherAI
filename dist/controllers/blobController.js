"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFile = addFile;
const storage_blob_1 = require("@azure/storage-blob");
const uuid_1 = require("uuid");
const mssql_1 = __importDefault(require("mssql"));
const Config_1 = require("../Config");
const connectionString = "DefaultEndpointsProtocol=https;AccountName=garageimages;AccountKey=gPuxf+12tvDahbJEg82cw6vVxEogirYUQlRixxOkg6JjM2nvPUnO02J84KYixdF7kGNKKqj8Ct+V+AStUDmSJA==;EndpointSuffix=core.windows.net";
const containerName = "imageuploads";
function addFile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { CompanyId, Department } = req.body;
            const file = req.file; // Typecasting file
            if (!file) {
                return res.status(400).send("No file uploaded.");
            }
            const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            yield containerClient.createIfNotExists({ access: "blob" });
            const blobName = `${(0, uuid_1.v4)()}-${file.originalname}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            yield blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: { blobContentType: file.mimetype },
            });
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            yield pool.request()
                .input("CompanyId", CompanyId)
                .input("Department", Department)
                // .input("CompanyId", 2)
                // .input("Department", "Finance")
                .input("DocumentURL", blockBlobClient.url)
                .execute("addDocument");
            return res.status(200).json({ imageUrl: blockBlobClient.url });
        }
        catch (error) {
            console.error("Upload failed:", error.message);
            return res.status(500).send("Upload failed.");
        }
    });
}
