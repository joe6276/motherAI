import { Request, Response } from "express";
import twilio from 'twilio'
import mssql from 'mssql'
import { sqlConfig } from "../Config";
import bcrypt from 'bcryptjs'
import { User } from "../interfaces";
const API_KEy = process.env.API_URL as string
const API_URL = "https://api.openai.com/v1/chat/completions"

interface Users {
    role: string
    content: string
}

export async function getChatResponse(message: string, userId: string) {
    const pool = await mssql.connect(sqlConfig)
    const occupation = await (await pool.request().input("Id", userId).execute("getUserById")).recordset

    const messages: Users[] = [{
        role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
        also Kindly advise based on User profession which is ${occupation[0].Occupation}
    `}]

    console.log(messages);


    const history = await (await pool.request().input("UserId", userId).execute("GetUserRecords")).recordset

    if (history.length) {
        history.forEach(element => {
            messages.push({ role: "user", content: element.originalCommand })
            messages.push({ role: "assistant", content: element.output })

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
            model: 'gpt-4-turbo',
            messages,
            temperature: 0.9 //0-2
        })


    })
    const content = await response.json()
    return content.choices[0].message.content
}

export async function insertToDB(question: string, response: string, channel: string, userId: string) {
    try {
        const pool = await mssql.connect(sqlConfig);
        await pool.request()
            .input("originalCommand", question)
            .input("parsedTask", response)
            .input("channel", channel)
            .input("status", "Completed")
            .input("UserId", userId)
            .input("output", response)
            .execute("InsertRecord");
    } catch (err) {

    }
}

export async function aiChat(req: Request, res: Response) {
    try {
        const { question, userId } = req.body

        const response = await getChatResponse(question, userId)

        await insertToDB(question, response, "website", userId)
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json(error)
    }
}


export async function getRecords(req: Request, res: Response) {
    try {
        const pool = await mssql.connect(sqlConfig)
        const records = await (await pool.request()
            .execute("GetAllRecords")).recordset

        res.status(200).json(records)
    } catch (error) {
        return res.status(500).json(error)
    }
}


// async function loginWhatsapp(req: Request, res: Response){

//     let object={
//         email:"",
//         password:""
//     }
//     try {
//         const from = req.body.From;
//         const to = req.body.TO
//         const message = req.body.Body;
//         const now = new Date();
//         const pool =await mssql.connect(sqlConfig)
//        var user = await(await pool.request()
//         .input("Username", message)
//         .execute("GetAllRecords")).recordset
//         if(user.length!==0 && now < new Date(user[0].CreatedAt)){
//                 // he is logged in 
//         }else{
//              sendandReply(to ,from, "Kindly Login") 
//              object.email= 
//         }
//     } catch (error) {

//     }
// }
// export async function sendandReply(to:string, from:string , message:string) {
//     const Account_SID = process.env.ACCOUNT_SID as string
//     const Auth_TOKEN = process.env.AUTH_TOKEN as string
//     const client = twilio(Account_SID, Auth_TOKEN)
//     try {

//         // const number= from.split("+")[1]
//         // console.log(number);

//         // const response = await getChatResponse(message,number)

//         client.messages
//         .create({
//             from, // Twilio Sandbox Number
//             to,  // Your verified number
//             body:message,
//         })
//         .then(message => console.log(message.sid))
//         .catch(error => console.error(error));
//         // await insertToDB(message,response, "Whatsapp",number)

//     } catch (err) {
//         console.error('Error sending reply:', err);
//     }


// }

export async function loginUser(email: string, password: string) {


    ///Geneerate TOken
    const pool = await mssql.connect(sqlConfig)
    const user = await (await pool.request()
        .input("Email", email)
        .execute("getUserByEmail")).recordset as User[]

    const isValid = await bcrypt.compare(password, user[0].Password)

    if (!isValid || user.length == 0) {
        return false
    } else {
        return true;
    }

}


export async function sendandReply(req: Request, res: Response) {


    const from = req.body.From;
    const message = req.body.Body;
  console.log(req.body);

    const Account_SID = process.env.ACCOUNT_SID as string
    const Auth_TOKEN = process.env.AUTH_TOKEN as string
    const client = twilio(Account_SID, Auth_TOKEN)
    try {

        const number= from.split("+")[1]
        console.log(number);

        const response = await getChatResponse(message,number)

        client.messages
        .create({
            from: req.body.To, 
            to: req.body.From, 
            body:response,
        })
        .then(message => console.log(message.sid))
        .catch(error => console.error(error));
        await insertToDB(message,response, "Whatsapp",number)
        console.log(`Replied to ${from}`);
    } catch (err) {
        console.error('Error sending reply:', err);
    }
    res.send('<Response></Response>');
}
interface AuthState {
    email?: string;
    authenticated: boolean;
    state: 'INIT' | 'AWAITING_EMAIL' | 'AWAITING_PASSWORD' | 'AUTHENTICATED';
}
const userSessions = new Map<string, AuthState>();

const SESSION_TIMEOUT = 60 * 60 * 1000;

async function validateUserSession(username: string): Promise<boolean> {
    try {
        const pool = await mssql.connect(sqlConfig)

        const result = await pool.request()
            .input('Username', username)
            .execute("GetUserSessionByUsername")

        if (result.recordset.length === 0) {
            return false;
        }

        const createdAt = new Date(result.recordset[0].CreatedAt);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - createdAt.getTime();

        return timeDiff < SESSION_TIMEOUT;
    } catch (err) {
        console.error('Database error while validating session:', err);
        return false;
    }
}




function createNewAuthState(number: string): AuthState {
    return {
        authenticated: false,
        state: 'INIT',
    };
}

// export async function sendAndReply(req: Request, res: Response) {
//     const from = req.body.From;
//     const message = req.body.Body;
//     console.log(req.body);

//     const Account_SID = process.env.ACCOUNT_SID as string;
//     const Auth_TOKEN = process.env.AUTH_TOKEN as string;
//     const client = twilio(Account_SID, Auth_TOKEN);

//     try {
//         const number = from.split("+")[1];
//         console.log(number);

//         let responseText = '';

//         const isValidSession = await validateUserSession(number);


//         if (isValidSession) {

//         } else {

//         }

//     } catch (error) {

//     }
// }