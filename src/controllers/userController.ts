
import { Request, Response } from "express";
import mssql from 'mssql'
import bcrypt from 'bcryptjs'
import { sqlConfig } from "../Config";
import jwt from 'jsonwebtoken'
import { User } from "../interfaces/index";
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })




export async function createAdmin(req:Request, res:Response){
    try {
        const {firstName, lastName, email, password,companyId}= req.body
        const hashedPassword= await bcrypt.hash(password,10)
        const pool = await mssql.connect(sqlConfig)
        const user =await(await pool.request()
        .input("Email", email)
        .execute("getUserByEmail")).recordset
       
        if(user.length!=0){
            return res.status(400).json({message:"Email Already Exists!"})
        }
        await pool.request()
        .input("FirstName", firstName)
        .input("LastName", lastName)
        .input("Email", email)
        .input("Password", hashedPassword)
        .input("Role", "admin")
        .input("CompanyId", companyId)
        .execute("AddUser")

        return res.status(201).json({message:"user added"})
    } catch (error) {
        return res.status(500).json(error)
    }
}
export async function addUser(req:Request, res:Response){
    try {
        const {firstName, lastName, email, password,companyId}= req.body
        const hashedPassword= await bcrypt.hash(password,10)
        const pool = await mssql.connect(sqlConfig)
        const user =await(await pool.request()
        .input("Email", email)
        .execute("getUserByEmail")).recordset
       
        if(user.length!=0){
            return res.status(400).json({message:"Email Already Exists!"})
        }
        await pool.request()
        .input("FirstName", firstName)
        .input("LastName", lastName)
        .input("Email", email)
        .input("Password", hashedPassword)
        .input("Role", "user")
        .input("CompanyId", companyId)
        .execute("AddUser")

        return res.status(201).json({message:"user added"})
    } catch (error) {
        return res.status(500).json(error)
    }
}

export async function loginUser(req:Request, res:Response){
    try {
        const {email,password}= req.body
        ///Geneerate TOken
        const pool = await mssql.connect(sqlConfig)
        const user =await(await pool.request()
        .input("Email", email)
        .execute("getUserByEmail")).recordset as User[]
       
        const isValid =  await bcrypt.compare(password, user[0].Password)
       
        if( !isValid || user.length==0){
            return res.status(400).json({message:"Invalid Credentials"})
        }else{
            const token = jwt.sign({id:user[0].Id},process.env.SECRET as string)
            return res.status(200).json({message:"Login Successful", companyId:user[0].CompanyId ,token, id:user[0].Id})
        }
    

       
       
    } catch (error) {
        return res.status(500).json(error)
    }
}