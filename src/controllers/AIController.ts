import { Request, Response } from "express";
import twilio from 'twilio'


const API_KEy = process.env.API_URL as string
const API_URL = "https://api.openai.com/v1/chat/completions"

interface Users {
    role: string
    content: string
}

export async function  getChatResponse( message:string){
    const messages: Users[] = [{
        role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
    `}]

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
    messages.push({ role: 'assistant', content: content.choices[0].message.content })

    return content.choices[0].message.content
}


export async function aiChat(req: Request, res: Response) {
    try {
        const {question}= req.body
        const response = await getChatResponse(question)
        return res.status(200).json({response})

    } catch (error) {
        return res.status(500).json(error)
    }
}


export async function sendandReply(req: Request, res: Response) {

    console.log(req.body)
    const from = 'whatsapp:+254769921156';
    const message = req.body.Body;
    console.log(req.body);
    const Account_SID = process.env.ACCOUNT_SID as string
    const Auth_TOKEN = process.env.AUTH_TOKEN as string
    const client = twilio(Account_SID, Auth_TOKEN)
    try {

        const response = await getChatResponse(message)

        client.messages
        .create({
            from: req.body.To, // Twilio Sandbox Number
            to: req.body.From,  // Your verified number
            body:response,
        })
        .then(message => console.log(message.sid))
        .catch(error => console.error(error));
        
        console.log(`Replied to ${from}`);
    } catch (err) {
        console.error('Error sending reply:', err);
    }

    // ✅ Twilio still expects an XML response even if you send the reply via API
    res.send('<Response></Response>');
}


