import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import TelegramBot from 'node-telegram-bot-api'
import { getChatResponse } from './AIController';

const bot = new TelegramBot(process.env.TElEGRAM as string, { polling: true });

bot.on('message', async (msg) => {
    console.log(msg)
    const chatId = msg.chat.id;
    const userMessage = msg.text as string;
  
    // Call your GPT API or custom logic here
    const botReply = await getChatResponse(userMessage);
  
    // Simulate typing
    await bot.sendChatAction(chatId, 'typing');
    await new Promise(resolve => setTimeout(resolve, 1500));
  
    bot.sendMessage(chatId, botReply);
})