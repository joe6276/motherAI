"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blobController_1 = require("../controllers/blobController");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const uploadRouter = (0, express_1.Router)();
uploadRouter.post("/upload", upload.single("image"), blobController_1.addFile);
exports.default = uploadRouter;
