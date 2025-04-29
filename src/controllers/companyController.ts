import { Request, Response } from "express";
import mssql from 'mssql'
import { sqlConfig } from "../Config";

export async function addCompany(req:Request, res:Response){

    try {
        
        const {companyName}=req.body

        const pool = await mssql.connect(sqlConfig)
        await pool.request()
        .input("CompanyName",companyName)
        .execute("AddCompany")

        res.status(201).json({message:'company added!'})
    } catch (error) {
        res.status(500).json(error)
    }
}



export async function getCompanies(req:Request, res:Response){

    try {
        const pool = await mssql.connect(sqlConfig)
        const response= await (await pool.request().execute("GetAllCompanies")).recordset
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json(error)
    }
}