"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySuperAdminToken = verifySuperAdminToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
function verifySuperAdminToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    try {
        if (!token) {
            return res.status(401).json({ error: 'Forbidden' });
        }
        const payloaddata = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        if (payloaddata.role.toLocaleLowerCase() !== 'superAdmin'.toLocaleLowerCase()) {
            return res.status(401).json({ error: 'Forbidden' });
        }
    }
    catch (error) {
        res.status(403).json(error.message);
    }
    next();
}
