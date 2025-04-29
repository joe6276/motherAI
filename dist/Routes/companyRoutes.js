"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyController_1 = require("../controllers/companyController");
const middleWares_1 = require("../middleWares");
const companyRouter = (0, express_1.Router)();
companyRouter.get("", companyController_1.getCompanies);
companyRouter.post("", middleWares_1.verifySuperAdminToken, companyController_1.addCompany);
exports.default = companyRouter;
