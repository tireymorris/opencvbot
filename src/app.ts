import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
app.use(bodyParser.raw());

const port = process.env.PORT || 3001;
const token = process.env.API_TOKEN;

let detectingMotion = true;
let fetchingOn = false;

const getTimestamp = () => new Date(Date.now()).toLocaleString('en-US', { timeZone: "America/Chicago" });

if (!token) {
  console.error('API token not found. Please pass API_TOKEN environment variable');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/subscribe(.*)/, (msg: any) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Affirmativo hombre - use endpoint '/motion?chatId=${chatId}' to run motion detection code.`);
});

const toggleMotionDetect = (chatId: string) => {
  const message = `Motion detection turned ${detectingMotion ? 'off' : 'on'} at ${getTimestamp()}`;

  detectingMotion = !detectingMotion;

  bot.sendMessage(chatId, message);
  console.log(message);
  return message;
};

const toggleFetch = (chatId: string) => {
  const message = `${fetchingOn ? 'Canceling' : 'Starting'} fetch at ${getTimestamp()}`;

  fetchingOn = !fetchingOn;

  bot.sendMessage(chatId, message);
  console.log(message);
  return message;
};

bot.onText(/\/toggle(.*)/, (msg: any) => {
  const chatId = msg.chat.id;
  toggleMotionDetect(chatId);
});

bot.onText(/\/fetch(.*)/, (msg: any) => {
  const chatId = msg.chat.id;
  toggleFetch(chatId);
});

app.get('/toggle', (req, res) => {
  const message = toggleMotionDetect(req.query.chatId);
  res.send(message);
});

app.get('/fetch', (req, res) => {
  const message = toggleFetch(req.query.chatId);
  res.send(message);
});

app.get('/should_fetch', (req, res) => {
  res.send(fetchingOn ? 'true' : 'false');
});

app.post('/motion', (req, res) => {
  if (!fetchingOn && !detectingMotion) {
    res.statusCode = 500;
    res.send('Motion detection is currently disabled');
    return;
  }

  const chatId = req.query.chatId;

  if (!chatId) {
    console.error('Chat ID query param not found.');
    return;
  }

  const image = Buffer.from(req.body);

  if (image && fetchingOn && req.query.idle) {
    fetchingOn = false;
    bot.sendPhoto(chatId, image);
    return;
  } else if (image && !fetchingOn && !req.query.idle) {
    bot.sendPhoto(chatId, image);
  }

  const message = `Motion detected at ${getTimestamp()} `;

  res.send(message);
  console.log(message);

  bot.sendMessage(chatId, message);
});

app.listen(port, () => console.log(`App is listening on port ${port} `));
