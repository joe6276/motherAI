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
exports.createAdmin = createAdmin;
exports.addUser = addUser;
exports.loginUser = loginUser;
exports.getAdmin = getAdmin;
const mssql_1 = __importDefault(require("mssql"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Config_1 = require("../Config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
function createAdmin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName, email, password, companyId, occupation } = req.body;
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            const user = yield (yield pool.request()
                .input("Email", email)
                .execute("getUserByEmail")).recordset;
            if (user.length != 0) {
                return res.status(400).json({ message: "Email Already Exists!" });
            }
            yield pool.request()
                .input("FirstName", firstName)
                .input("LastName", lastName)
                .input("Email", email)
                .input("Password", hashedPassword)
                .input("Role", "admin")
                .input("CompanyId", companyId)
                .input("Occupation", occupation)
                .execute("AddUser");
            return res.status(201).json({ message: "user added" });
        }
        catch (error) {
            return res.status(500).json(error);
        }
    });
}
function addUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName, email, password, companyId, occupation } = req.body;
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            const user = yield (yield pool.request()
                .input("Email", email)
                .execute("getUserByEmail")).recordset;
            if (user.length != 0) {
                return res.status(400).json({ message: "Email Already Exists!" });
            }
            yield pool.request()
                .input("FirstName", firstName)
                .input("LastName", lastName)
                .input("Email", email)
                .input("Password", hashedPassword)
                .input("Role", "user")
                .input("CompanyId", companyId)
                .input("Occupation", occupation)
                .execute("AddUser");
            return res.status(201).json({ message: "user added" });
        }
        catch (error) {
            return res.status(500).json(error);
        }
    });
}
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            ///Geneerate TOken
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            const user = yield (yield pool.request()
                .input("Email", email)
                .execute("getUserByEmail")).recordset;
            const isValid = yield bcryptjs_1.default.compare(password, user[0].Password);
            if (!isValid || user.length == 0) {
                return res.status(400).json({ message: "Invalid Credentials" });
            }
            else {
                const token = jsonwebtoken_1.default.sign({ id: user[0].Id, role: user[0].Role }, process.env.SECRET);
                return res.status(200).json({ message: "Login Successful", companyId: user[0].CompanyId, token, id: user[0].Id });
            }
        }
        catch (error) {
            return res.status(500).json(error);
        }
    });
}
function getAdmin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            const user = yield (yield pool.request()
                .input("CompanyId", req.params.id)
                .execute("GetAdmin")).recordset;
            return res.status(200).json(user);
        }
        catch (error) {
            return res.status(500).json(error);
        }
    });
}
