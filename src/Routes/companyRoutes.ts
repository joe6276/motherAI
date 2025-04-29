import { Router } from "express";
import { addCompany, getCompanies } from "../controllers/companyController";
import { verifySuperAdminToken } from "../middleWares";

const companyRouter = Router()


companyRouter.get("", getCompanies)
companyRouter.post("",verifySuperAdminToken, addCompany)


export default companyRouter