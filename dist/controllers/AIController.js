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
exports.chatWithFinanceBot = chatWithFinanceBot;
exports.getChatResponse = getChatResponse;
exports.getChatResponse2 = getChatResponse2;
exports.getChatResponse1 = getChatResponse1;
exports.insertToDB = insertToDB;
exports.aiChat = aiChat;
exports.getRecords = getRecords;
exports.loginUserBot = loginUserBot;
exports.getOccupation = getOccupation;
exports.getDocument = getDocument;
exports.sendandReply = sendandReply;
const twilio_1 = __importDefault(require("twilio"));
const mssql_1 = __importDefault(require("mssql"));
const Config_1 = require("../Config");
const API_KEy = process.env.API_URL;
const API_URL = "https://api.openai.com/v1/chat/completions";
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const faiss_1 = require("@langchain/community/vectorstores/faiss");
const openai_1 = require("@langchain/openai");
const chains_1 = require("langchain/chains");
const xlsx_1 = __importDefault(require("xlsx"));
const openai_2 = require("@langchain/openai");
const text_splitter_1 = require("langchain/text_splitter");
function chatWithFinanceBot(fileUrl, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const openAIApiKey = API_KEy;
        const response = yield axios_1.default.get(fileUrl, { responseType: 'arraybuffer' });
        const data = response.data;
        // 2. Parse the workbook
        const workbook = xlsx_1.default.read(data, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;
        let raw_text = "";
        sheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const rows = xlsx_1.default.utils.sheet_to_json(sheet, { header: 1 });
            raw_text += `\n=== Sheet: ${sheetName} ===\n`;
            rows.forEach((row) => {
                raw_text += row.join(" ") + "\n";
            });
        });
        // 3. Split text
        const textSplitter = new text_splitter_1.CharacterTextSplitter({
            separator: "\n",
            chunkSize: 1000,
            chunkOverlap: 200,
            lengthFunction: (text) => text.length
        });
        const texts = yield textSplitter.splitText(raw_text);
        console.log(texts);
        // 4. Generate embeddings
        const documentSearch = yield faiss_1.FaissStore.fromTexts(texts, {}, new openai_2.OpenAIEmbeddings({ openAIApiKey }));
        // 5. Perform search
        const resultOne = yield documentSearch.similaritySearch(query, 1);
        // 6. QA Chain with system message
        const llm = new openai_1.ChatOpenAI({
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
        const chain = (0, chains_1.loadQAStuffChain)(llm);
        const result = yield chain.call({
            input_documents: resultOne,
            question: query
        });
        console.log(result);
        return result.text;
    });
}
function getChatResponse(message, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const occupation = yield (yield pool.request().input("Id", userId).execute("getUserById")).recordset;
        const messages = [{
                role: 'system', content: `
        You an Experienced Assistant Kindly advise based on User profession which is ${occupation[0].Occupation}
    `
            }];
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
function getChatResponse2(message, occupation) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const messages = [{
                role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
        also Kindly advise based on User profession which is ${occupation}
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
function getChatResponse1(message, userId, occupation) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const messages = [{
                role: 'system', content: `
        You an Experienced Marketter with alot of experience in the field .You work is to answer any marketing question asked in a simple way.
      also Kindly advise based on User profession which is ${occupation}
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
function loginUserBot(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const user = yield (yield pool.request()
            .input("Email", email)
            .execute("getUserByEmail")).recordset;
        const isValid = yield bcryptjs_1.default.compare(password, user[0].Password);
        if (!isValid || user.length == 0) {
            return { islogged: false };
        }
        else {
            return { islogged: true, occupation: user[0].Occupation };
        }
    });
}
function getOccupation(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const user = yield (yield pool.request()
            .input("Email", email)
            .execute("getUserByEmail")).recordset;
        return user;
    });
}
function getDocument(companyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect(Config_1.sqlConfig);
        const document = yield (yield pool.request()
            .input("CompanyId", companyId)
            .input("Department", "Finance")
            .execute("GetDocuments")).recordset;
        return document[0];
    });
}
const loginSteps = new Map();
function sendandReply(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const from = req.body.From;
        const to = req.body.To;
        const message = (_a = req.body.Body) === null || _a === void 0 ? void 0 : _a.trim();
        const client = (0, twilio_1.default)(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
        let myemail = '';
        let responseMessage = "";
        try {
            const session = loginSteps.get(from) || { step: 1, temp: {} };
            if (session.step === 1) {
                responseMessage = "Welcome! Please enter your email to log in.";
                session.step = 2;
                loginSteps.set(from, session);
            }
            else if (session.step === 2) {
                session.temp.email = message;
                session.step = 3;
                loginSteps.set(from, session);
                responseMessage = "Thank you. Now, please enter your password.";
            }
            else if (session.step === 3) {
                const { email } = session.temp;
                const password = message;
                const isLoginValid = yield loginUserBot(email, password);
                myemail = email;
                if (isLoginValid) {
                    loginSteps.set(from, { step: 4, temp: { email } });
                    responseMessage = `✅ Login successful. Welcome ${email}! You can now chat with the bot.`;
                }
                else {
                    loginSteps.delete(from);
                    responseMessage = "❌ Invalid credentials. Please start again by typing your email.";
                }
            }
            else {
                // Step 4: Already authenticated
                console.log("here", (_b = session.temp) === null || _b === void 0 ? void 0 : _b.email);
                const userres = yield getOccupation((_c = session.temp) === null || _c === void 0 ? void 0 : _c.email);
                console.log(userres);
                let responseMessage = "";
                if (userres[0].Department.toLowerCase() === "Finance".toLowerCase()) {
                    const document = yield getDocument(userres[0].CompanyId);
                    responseMessage = yield chatWithFinanceBot(document.DocumentURL, message);
                    console.log("Respones", responseMessage);
                    yield client.messages.create({
                        from: to,
                        to: from,
                        body: responseMessage
                    });
                }
                else {
                    const response = yield getChatResponse1(message, from, userres[0].Occupation);
                    responseMessage = response;
                }
                console.log(responseMessage);
            }
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
