import qrcode from 'qrcode-terminal';

import { Client } from 'whatsapp-web.js';
import { Configuration, OpenAIApi } from 'openai';
import * as dotenv from 'dotenv';


dotenv.config();
const client = new Client({
  puppeteer: {
    headless: false
  }
});

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.initialize();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

client.on('message', async (message) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: process.env.OPENAI_PROMT,
        },
        {
          role: 'user',
          content: `${message.body}`,
        }
      ],
    });

    const d = response.data.choices[0].message.content;

    client.sendMessage(message.from, d.trim() );
  } catch(error){
    console.error(`error:`, error);
  }
});
