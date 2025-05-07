import { Request, Response } from "express";
import twilio from 'twilio'
import mssql from 'mssql'
import { sqlConfig } from "../Config";
const API_KEy = process.env.API_URL as string
const API_URL = "https://api.openai.com/v1/chat/completions"
import bcrypt from 'bcryptjs'
import { User } from "../interfaces";
import axios from 'axios';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatOpenAI } from '@langchain/openai';
import { loadQAStuffChain } from "langchain/chains";
import xlsx from 'xlsx';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CharacterTextSplitter } from "langchain/text_splitter";

interface Users {
    role: string
    content: string
}


export async function chatWithFinanceBot(fileUrl:string, query:string) {
    const openAIApiKey = API_KEy
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const data = response.data;

  // 2. Parse the workbook
  const workbook = xlsx.read(data, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;

  let raw_text = "";

  sheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    raw_text += `\n=== Sheet: ${sheetName} ===\n`;
    rows.forEach((row: any) => {
      raw_text += row.join(" ") + "\n";
    });
  });

  // 3. Split text
  const textSplitter = new CharacterTextSplitter({
    separator: "\n",
    chunkSize: 1000,
    chunkOverlap: 200,
    lengthFunction: (text) => text.length
  });

  const texts = await textSplitter.splitText(raw_text);
console.log(texts);

 
  // 4. Generate embeddings
  const documentSearch = await FaissStore.fromTexts(texts, {}, new OpenAIEmbeddings({ openAIApiKey }));

  // 5. Perform search

  const resultOne = await documentSearch.similaritySearch(query, 1);

  // 6. QA Chain with system message
  const llm = new ChatOpenAI({
    openAIApiKey,
    model: "gpt-3.5-turbo",
    temperature: 0.9,
    prefixMessages: [
      {
        role: "system",
        content: `You are a highly skilled financial assistant specialized in analyzing Excel spreadsheets containing financial data. Focus exclusively on finance-related information such as budgets, expenses, revenue, forecasts, balance sheets, and other financial metrics.
        Use your strong mathematical and analytical skills to interpret and summarize the data clearly and accurately. Do not provide information outside the financial domain. If the data is incomplete or unclear, suggest performing a web search for additional financial context—do not fabricate any details.
    Maintain precision, relevance, and clarity in all responses.`
      }
    ]
  });

  const chain = loadQAStuffChain(llm);
  const result = await chain.call({
    input_documents: resultOne,
    question: query
  });
  console.log(result);


return result.text as string
}



export async function getChatResponse(message: string, userId: string) {
    const pool = await mssql.connect(sqlConfig)
    const occupation = await (await pool.request().input("Id", userId).execute("getUserById")).recordset

    const messages: Users[] = [{
        role: 'system', content: `
        You an Experienced Assistant Kindly advise based on User profession which is ${occupation[0].Occupation}
    `}]


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
    // const pool = await mssql.connect(sqlConfig)
    
    const messages: Users[] = [{
        role: 'system', content: `
        You an Experienced Assistant, Kindly advise based on User profession which is ${occupation}
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

export async function getOccupation(email:string){    
    const pool = await mssql.connect(sqlConfig)
    const user =await(await pool.request()
    .input("Email", email)
    .execute("getUserByEmail")).recordset as User[]   
        return user  
}

export async function getDocument(companyId:number){    
    const pool = await mssql.connect(sqlConfig)
    const document =await(await pool.request()
    .input("CompanyId", companyId)
    .input("Department", "Finance")
    .execute("GetDocuments")).recordset  

    return document[0] 
}


const loginSteps = new Map<string, { step: number, temp: any }>();

export async function sendandReply(req: Request, res: Response) {
    const from = req.body.From;
    const to = req.body.To;
    const message = req.body.Body?.trim();
    const client = twilio(process.env.ACCOUNT_SID!, process.env.AUTH_TOKEN!);

    let myemail='';
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
            myemail=email
            
            if (isLoginValid) {
                loginSteps.set(from, { step: 4, temp: { email } });
                responseMessage = `✅ Login successful. Welcome ${email}! You can now chat with the bot.`;
            } else {
                loginSteps.delete(from);
                responseMessage = "❌ Invalid credentials. Please start again by typing your email.";
            }
        } else {
            // Step 4: Already authenticated
            console.log("here" , session.temp?.email);
            const userres = await getOccupation(session.temp?.email)
            console.log(userres)

            let responseMessage=""
                if(userres[0].Department.toLowerCase() === "Finance".toLowerCase()){
                    const document = await getDocument(userres[0].CompanyId)
                    responseMessage = await chatWithFinanceBot(document.DocumentURL, message)
              
                }else{
                    const response = await getChatResponse1(message, from,   userres[0].Occupation );
                    responseMessage = response;
                }

                console.log(responseMessage);
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
