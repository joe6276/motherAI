import { Request, Response } from "express";
import twilio from 'twilio'
import mssql from 'mssql'
import { sqlConfig } from "../Config";
const API_KEy = process.env.API_URL as string
const API_URL = "https://api.openai.com/v1/chat/completions"
import bcrypt from 'bcryptjs'
import { User } from "../interfaces";

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
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.9 //0-2
        })


    })
    const content = await response.json()
    return content.choices[0].message.content
}


export async function getChatResponse2(message: string,occupation:string) {
    const pool = await mssql.connect(sqlConfig)
    
    const messages: Users[] = [{
        role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
        also Kindly advise based on User profession which is ${occupation}
    `}]

    console.log(messages);


//  history = await (await pool.request().input("UserId", userId).execute("GetUserRecords")).recordset

//     if (history.length) {
//         history.forEach(element => {
//             messages.push({ role: "user", content: element.originalCommand })
//             messages.push({ role: "assistant", content: element.output })

//         });
//     }

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

export async function getChatResponse1(message: string ,userId:string, occupation:string) {
    const pool = await mssql.connect(sqlConfig)
  
    const messages: Users[] = [{
        role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
      also Kindly advise based on User profession which is ${occupation}
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
            model: 'gpt-3.5-turbo',
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

        // await insertToDB(question, response, "website", userId)
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

export async function loginUserBot(email:string, password:string){    
        const pool = await mssql.connect(sqlConfig)
        const user =await(await pool.request()
        .input("Email", email)
        .execute("getUserByEmail")).recordset as User[]
       
        const isValid =  await bcrypt.compare(password, user[0].Password)
       
        if( !isValid || user.length==0){
            return {islogged:false}
        }else{
            
            return {islogged:true, occupation:user[0].Occupation}
        }
}
const loginSteps = new Map<string, { step: number, temp: any }>();

export async function sendandReply(req: Request, res: Response) {
    const from = req.body.From;
    const to = req.body.To;
    const message = req.body.Body?.trim();
    const client = twilio(process.env.ACCOUNT_SID!, process.env.AUTH_TOKEN!);

    let result;
    let responseMessage = "";

    try {
        const session = loginSteps.get(from) || { step: 1, temp: {} };

        if (session.step === 1) {
            responseMessage = "Welcome! Please enter your email to log in.";
            session.step = 2;
            loginSteps.set(from, session);
        } else if (session.step === 2) {
            session.temp.email = message;
            session.step = 3;
            loginSteps.set(from, session);
            responseMessage = "Thank you. Now, please enter your password.";
        } else if (session.step === 3) {
            const { email } = session.temp;
            const password = message;

            const isLoginValid= await loginUserBot(email,password)
            result=isLoginValid
            console.log(result);
            
            if (isLoginValid) {
                loginSteps.set(from, { step: 4, temp: { email } });
                responseMessage = `✅ Login successful. Welcome ${email}! You can now chat with the bot.`;
            } else {
                loginSteps.delete(from);
                responseMessage = "❌ Invalid credentials. Please start again by typing your email.";
            }
        } else {
            // Step 4: Already authenticated
            console.log("here" ,result);
            const response = await getChatResponse1(message, from,   result!.occupation as string);
            responseMessage = response;
        }

        await client.messages.create({
            from: to,
            to: from,
            body: responseMessage
        });

        await insertToDB(message, responseMessage, "Whatsapp", from);
        console.log(`Replied to ${from}`);
    } catch (err) {
        console.error("Error:", err);
    }

    res.send("<Response></Response>");
}
