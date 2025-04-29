import { Request, Response } from "express";
import twilio from 'twilio'
import mssql from 'mssql'
import { sqlConfig } from "../Config";

const API_KEy = process.env.API_URL as string
const API_URL = "https://api.openai.com/v1/chat/completions"

interface Users {
    role: string
    content: string
}

export async function  getChatResponse( message:string, userId:string){
    const messages: Users[] = [{
        role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
    `}]


    const pool = await mssql.connect(sqlConfig)
    const history= await(await pool.request().input("UserId", userId).execute("GetUserRecords")).recordset 

   if(history.length){
    history.forEach(element => {
        messages.push({role:"user", content:element.originalCommand})
        messages.push({role:"assistant", content:element.output})
       
    });
   }

   messages.push({ role: "user", content: message })


    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${API_KEy}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.9 //0-2
        })


    })
    const content = await response.json()
    return content.choices[0].message.content
}

export async function  insertToDB(question:string, response:string, channel:string, userId:string){
    try{
        const pool = await mssql.connect(sqlConfig);
        await pool.request()
        .input("originalCommand", question)      
        .input("parsedTask", response)            
        .input("channel", channel)             
        .input("status", "Completed")  
        .input("UserId", userId)          
        .input("output", response)                
        .execute("InsertRecord");
    }catch(err){

    }
}

export async function aiChat(req: Request, res: Response) {
    try {
        const {question, userId}= req.body

        const response = await getChatResponse(question, userId)
        
        await insertToDB(question,response, "website",userId)
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json(error)
    }
}


export async function getRecords( req:Request, res:Response){
    try{
        const pool =await mssql.connect(sqlConfig)
        const records=await(await pool.request()
        .execute("GetAllRecords")).recordset

        res.status(200).json(records)
    }catch(error){
        return res.status(500).json(error)
    }
}

export async function sendandReply(req: Request, res: Response) {


    const from = req.body.From;
    const message = req.body.Body;  
    const Account_SID = process.env.ACCOUNT_SID as string
    const Auth_TOKEN = process.env.AUTH_TOKEN as string
    const client = twilio(Account_SID, Auth_TOKEN)
    try {

        const number= from.split("+")[1]
     
        
        const response = await getChatResponse(message,number)

        client.messages
        .create({
            from: req.body.To, // Twilio Sandbox Number
            to: req.body.From,  // Your verified number
            body:response,
        })
        .then(message => console.log(message.sid))
        .catch(error => console.error(error));
        await insertToDB(message,response, "Whatsapp",number)
        console.log(`Replied to ${from}`);
    } catch (err) {
        console.error('Error sending reply:', err);
    }

    // ✅ Twilio still expects an XML response even if you send the reply via API
    res.send('<Response></Response>');
}


