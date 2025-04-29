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
exports.addCompany = addCompany;
exports.getCompanies = getCompanies;
const mssql_1 = __importDefault(require("mssql"));
const Config_1 = require("../Config");
function addCompany(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { companyName } = req.body;
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            yield pool.request()
                .input("CompanyName", companyName)
                .execute("AddCompany");
            res.status(201).json({ message: 'company added!' });
        }
        catch (error) {
            res.status(500).json(error);
        }
    });
}
function getCompanies(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            const response = yield (yield pool.request().execute("GetAllCompanies")).recordset;
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json(error);
        }
    });
}
