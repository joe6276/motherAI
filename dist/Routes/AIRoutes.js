"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AIController_1 = require("../controllers/AIController");
const router = express_1.default.Router();
router.post("", AIController_1.aiChat);
router.post('/webhook', AIController_1.sendandReply);
exports.default = router;
