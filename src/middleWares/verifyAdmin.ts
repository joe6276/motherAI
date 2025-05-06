import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'
import { DecodedData } from "../interfaces";
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export function verifyAdmin(req:Request, res:Response, next:NextFunction){

    const authHeader = req.headers['authorization'];
   
    
    const token = authHeader && authHeader.startsWith('Bearer')
      ? authHeader.split(' ')[1]
      : null;
      try {
        if(!token){
            return res.status(401).json({error:'Forbidden'})
        }

        const payloaddata= jwt.verify(token, process.env.SECRET as string ) as DecodedData
         
            
        if(payloaddata.role.toLocaleLowerCase() !=='admin'.toLocaleLowerCase()){
            return res.status(401).json({error:'Forbidden'})
        }
      } catch (error:any) {
        return res.status(403).json(error.message)
      }
      
      next()
}