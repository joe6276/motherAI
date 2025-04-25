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
bot.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(msg);
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    // Call your GPT API or custom logic here
    const botReply = yield (0, AIController_1.getChatResponse)(userMessage);
    // Simulate typing
    yield bot.sendChatAction(chatId, 'typing');
    yield new Promise(resolve => setTimeout(resolve, 1500));
    bot.sendMessage(chatId, botReply);
}));
