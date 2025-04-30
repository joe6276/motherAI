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
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const AIController_1 = require("./AIController");
const bot = new node_telegram_bot_api_1.default(process.env.TElEGRAM, { polling: true });
const loginSteps = new Map();
bot.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const chatId = msg.chat.id;
    const userMessage = (_a = msg.text) === null || _a === void 0 ? void 0 : _a.trim();
    const username = ((_b = msg.from) === null || _b === void 0 ? void 0 : _b.username) || chatId.toString();
    let responseMessage = "";
    let result;
    try {
        const session = loginSteps.get(chatId) || { step: 1, temp: {} };
        if (session.step === 1) {
            responseMessage = "👋 Welcome! Please enter your email to log in.";
            session.step = 2;
            loginSteps.set(chatId, session);
        }
        else if (session.step === 2) {
            session.temp.email = userMessage;
            session.step = 3;
            loginSteps.set(chatId, session);
            responseMessage = "🔐 Now enter your password.";
        }
        else if (session.step === 3) {
            const { email } = session.temp;
            const password = userMessage;
            const isloginValid = yield (0, AIController_1.loginUserBot)(email, password);
            result = isloginValid;
            console.log(result);
            if (isloginValid.islogged) {
                session.step = 4;
                loginSteps.set(chatId, session);
                responseMessage = `✅ Login successful, ${email}. You can now chat with the bot.`;
            }
            else {
                loginSteps.delete(chatId);
                responseMessage = "❌ Invalid credentials. Please enter your email again to start over.";
            }
        }
        else {
            // Authenticated: Chatbot mode
            yield bot.sendChatAction(chatId, 'typing');
            const botReply = yield (0, AIController_1.getChatResponse2)(userMessage, result.occupation);
            responseMessage = botReply;
            // Store conversation
            yield (0, AIController_1.insertToDB)(userMessage, botReply, "Telegram", username);
        }
        // Send response
        yield bot.sendMessage(chatId, responseMessage);
    }
    catch (error) {
        console.error("Error in Telegram bot:", error);
        yield bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again.");
    }
}));
