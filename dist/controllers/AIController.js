"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatResponse = getChatResponse;
exports.insertToDB = insertToDB;
exports.aiChat = aiChat;
exports.getRecords = getRecords;
exports.loginUser = loginUser;
exports.sendandReply = sendandReply;
const twilio_1 = __importDefault(require("twilio"));
const mssql_1 = __importDefault(require("mssql"));
const Config_1 = require("../Config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const API_KEy = process.env.API_URL;
const API_URL = "https://api.openai.com/v1/chat/completions";
function getChatResponse(message, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const occupation = yield (yield pool.request().input("Id", userId).execute("getUserById")).recordset;
        const messages = [{
                role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
        also Kindly advise based on User profession which is ${occupation[0].Occupation}
    `
            }];
        console.log(messages);
        const history = yield (yield pool.request().input("UserId", userId).execute("GetUserRecords")).recordset;
        if (history.length) {
            history.forEach(element => {
                messages.push({ role: "user", content: element.originalCommand });
                messages.push({ role: "assistant", content: element.output });
            });
        }
        messages.push({ role: "user", content: message });
        const response = yield fetch(API_URL, {
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
        });
        const content = yield response.json();
        return content.choices[0].message.content;
    });
}
function insertToDB(question, response, channel, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            yield pool.request()
                .input("originalCommand", question)
                .input("parsedTask", response)
                .input("channel", channel)
                .input("status", "Completed")
                .input("UserId", userId)
                .input("output", response)
                .execute("InsertRecord");
        }
        catch (err) {
        }
    });
}
function aiChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { question, userId } = req.body;
            const response = yield getChatResponse(question, userId);
            yield insertToDB(question, response, "website", userId);
            return res.status(200).json(response);
        }
        catch (error) {
            return res.status(500).json(error);
        }
    });
}
function getRecords(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            const records = yield (yield pool.request()
                .execute("GetAllRecords")).recordset;
            res.status(200).json(records);
        }
        catch (error) {
            return res.status(500).json(error);
        }
    });
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
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        ///Geneerate TOken
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const user = yield (yield pool.request()
            .input("Email", email)
            .execute("getUserByEmail")).recordset;
        const isValid = yield bcryptjs_1.default.compare(password, user[0].Password);
        if (!isValid || user.length == 0) {
            return false;
        }
        else {
            return true;
        }
    });
}
function sendandReply(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const from = req.body.From;
        const message = req.body.Body;
        console.log(req.body);
        const Account_SID = process.env.ACCOUNT_SID;
        const Auth_TOKEN = process.env.AUTH_TOKEN;
        const client = (0, twilio_1.default)(Account_SID, Auth_TOKEN);
        try {
            const number = from.split("+")[1];
            console.log(number);
            const response = yield getChatResponse(message, number);
            client.messages
                .create({
                from: req.body.To,
                to: req.body.From,
                body: response,
            })
                .then(message => console.log(message.sid))
                .catch(error => console.error(error));
            yield insertToDB(message, response, "Whatsapp", number);
            console.log(`Replied to ${from}`);
        }
        catch (err) {
            console.error('Error sending reply:', err);
        }
        res.send('<Response></Response>');
    });
}
const userSessions = new Map();
const SESSION_TIMEOUT = 60 * 60 * 1000;
function validateUserSession(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
            const result = yield pool.request()
                .input('Username', username)
                .execute("GetUserSessionByUsername");
            if (result.recordset.length === 0) {
                return false;
            }
            const createdAt = new Date(result.recordset[0].CreatedAt);
            const currentTime = new Date();
            const timeDiff = currentTime.getTime() - createdAt.getTime();
            return timeDiff < SESSION_TIMEOUT;
        }
        catch (err) {
            console.error('Database error while validating session:', err);
            return false;
        }
    });
}
function createNewAuthState(number) {
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
