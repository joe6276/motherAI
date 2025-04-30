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
exports.getChatResponse2 = getChatResponse2;
exports.getChatResponse1 = getChatResponse1;
exports.insertToDB = insertToDB;
exports.aiChat = aiChat;
exports.getRecords = getRecords;
exports.sendandReply = sendandReply;
const twilio_1 = __importDefault(require("twilio"));
const mssql_1 = __importDefault(require("mssql"));
const Config_1 = require("../Config");
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
                model: 'gpt-3.5-turbo',
                messages,
                temperature: 0.9 //0-2
            })
        });
        const content = yield response.json();
        return content.choices[0].message.content;
    });
}
function getChatResponse2(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const messages = [{
                role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
        
    `
            }];
        console.log(messages);
        //  history = await (await pool.request().input("UserId", userId).execute("GetUserRecords")).recordset
        //     if (history.length) {
        //         history.forEach(element => {
        //             messages.push({ role: "user", content: element.originalCommand })
        //             messages.push({ role: "assistant", content: element.output })
        //         });
        //     }
        messages.push({ role: "user", content: message });
        const response = yield fetch(API_URL, {
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
        });
        const content = yield response.json();
        return content.choices[0].message.content;
    });
}
function getChatResponse1(message, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const messages = [{
                role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
      
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
                model: 'gpt-3.5-turbo',
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
            // await insertToDB(question, response, "website", userId)
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
// export async function sendandReply(req: Request, res: Response) {
//     const from = req.body.From;
//     const message = req.body.Body;
//   console.log(req.body);
//     const Account_SID = process.env.ACCOUNT_SID as string
//     const Auth_TOKEN = process.env.AUTH_TOKEN as string
//     const client = twilio(Account_SID, Auth_TOKEN)
//     try {
//         const number= from.split("+")[1]
//         console.log(number);
//         const response = await getChatResponse1(message, number)
//         client.messages
//         .create({
//             from: req.body.To, // Twilio Sandbox Number
//             to: req.body.From,  // Your verified number
//             body:response,
//         })
//         .then(message => console.log(message.sid))
//         .catch(error => console.error(error));
//         await insertToDB(message,response, "Whatsapp",number)
//         console.log(`Replied to ${from}`);
//     } catch (err) {
//         console.error('Error sending reply:', err);
//     }
//     // ✅ Twilio still expects an XML response even if you send the reply via API
//     res.send('<Response></Response>');
// }
const loginSteps = new Map();
function sendandReply(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const from = req.body.From; // WhatsApp number
        const to = req.body.To; // Twilio number
        const message = (_a = req.body.Body) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase(); // Convert to lowercase for easier matching
        const now = new Date();
        const Account_SID = process.env.ACCOUNT_SID;
        const Auth_TOKEN = process.env.AUTH_TOKEN;
        const client = (0, twilio_1.default)(Account_SID, Auth_TOKEN);
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        let responseMessage = "";
        // Check if the message is a greeting (e.g., "hello", "hi", etc.)
        const greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"];
        const isGreeting = greetings.some(greet => message.includes(greet));
        try {
            // 1. Check if user has an active session (based on phone number)
            // const sessionCheck = await (await pool.request()
            //     .input("Username", from)
            //     .execute("GetAllRecords")).recordset;
            // const sessionValid = sessionCheck.length > 0 &&
            //     now < new Date(sessionCheck[0].CreatedAt.getTime() + 60 * 60 * 1000);
            // if (sessionValid) {
            //     // ✅ Already logged in — get chatbot response
            //     const response = await getChatResponse(message, from);
            //     responseMessage = response;
            // } else {
            // ❌ Not logged in — start login process
            const session = loginSteps.get(from) || { step: 1, temp: {} };
            // Start the login process if the user is not logged in
            if (session.step === 1 || isGreeting) {
                responseMessage = "Hello! Please log in by providing your email.";
                loginSteps.set(from, { step: 2, temp: {} });
            }
            else if (session.step === 2) {
                session.temp.email = message;
                session.step = 3;
                loginSteps.set(from, session);
                responseMessage = "What is your password?";
            }
            else if (session.step === 3) {
                const { email } = session.temp;
                const password = message;
                // 🔐 Validate email/password
                // const userCheck = await (await pool.request()
                //     .input("Email", email)
                //     .input("Password", password)
                //     .execute("ValidateUserByEmail")).recordset;
                // if (userCheck.length > 0) {
                //     // ✅ Valid: store session against phone number
                //     await pool.request()
                //         .input("Username", from)  // phone number
                //         .execute("CreateOrUpdateUserSession");
                //     loginSteps.delete(from);
                //     responseMessage = `Welcome ${email}, you're now logged in! You can now interact with the chatbot.`;
                // } else {
                //     loginSteps.delete(from);
                //     responseMessage = "Invalid credentials. Please start again.";
                // }
                // }
            }
            // ✅ Send WhatsApp reply
            yield client.messages.create({
                from: to,
                to: from,
                body: responseMessage
            });
            yield insertToDB(message, responseMessage, "Whatsapp", from);
            console.log(`Replied to ${from}`);
        }
        catch (err) {
            console.error("Error:", err);
        }
        res.send("<Response></Response>");
    });
}
