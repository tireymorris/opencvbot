import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
app.use(bodyParser.raw());

const port = process.env.PORT || 3001;
const token = process.env.API_TOKEN;
let serverOn = true;

if (!token) {
  console.error('API token not found. Please pass API_TOKEN environment variable');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/subscribe(.*)/, (msg: any) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Affirmativo hombre - use endpoint '/motion?chatId=${chatId}' to run motion detection code.`);
});

const onToggle = (chatId: string) => {
  const message = `Motion detection turned ${serverOn ? 'off' : 'on'} at ${new Date(Date.now()).toLocaleString('en-US')}`;

  serverOn = !serverOn;

  bot.sendMessage(chatId, message);
  console.log(message);
  return message;
};

bot.onText(/\/toggle(.*)/, (msg: any) => {
  const chatId = msg.chat.id;
  onToggle(chatId);
});

app.get('/toggle', (req, res) => {
  const message = onToggle(req.query.chatId);
  res.send(message);
});

app.post('/motion', (req, res) => {
  if (!serverOn) {
    res.statusCode = 500;
    res.send('Motion detection is currently disabled');
  }

  const message = `Motion detected at ${new Date(Date.now()).toLocaleString('en-US')}`;
  const chatId = req.query.chatId;
  const image = Buffer.from(req.body);

  res.send(message);
  console.log(message);

  if (!chatId) {
    console.error('Chat ID query param not found.');
    return;
  }

  bot.sendMessage(chatId, message);

  if (image) {
    bot.sendPhoto(chatId, image);
  }
});

app.listen(port, () => console.log(`App is listening on port ${port}`));
