import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
app.use(bodyParser.raw());

const port = process.env.PORT || 3001;
const token = process.env.API_TOKEN;

const detectingMotion = {};
const fetchingOn = {};

const getTimestamp = () => new Date(Date.now()).toLocaleString('en-US', { timeZone: "America/Chicago" });

if (!token) {
  console.error('API token not found. Please pass API_TOKEN environment variable');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/subscribe(.*)/, (msg: any) => {
  const chatId: string = msg.chat.id;
  detectingMotion[chatId] = true;
  fetchingOn[chatId] = true;
  bot.sendMessage(chatId,
    `Affirmativo hombre - use endpoint '/motion?chatId=${chatId}' to run motion detection code.\n\tNOTE: Must POST image to this endpoint`,
  );
});

bot.onText(/\/(help|commands|start)(.*)/, (msg: any) => {
  const chatId: string = msg.chat.id;
  const helpText = `
/help - display this message
/subscribe - register chat with BrambleBot, obtain API endpoint for backend
/toggle - turn motion detection on or off
/fetch - request a single frame from the backend
/status - returns whether the server is fetching a frame and detecting motion
  `;
  bot.sendMessage(chatId, helpText);
});

const toggleMotionDetect = (chatId: string) => {
  const message = `Motion detection turned ${detectingMotion[chatId] ? 'off' : 'on'} at ${getTimestamp()}`;

  detectingMotion[chatId] = !detectingMotion[chatId];

  bot.sendMessage(chatId, message);
  console.log(message);
  return message;
};

const toggleFetch = (chatId: string) => {
  const message = `${fetchingOn[chatId] ? 'Canceling' : 'Starting'} fetch at ${getTimestamp()}`;

  fetchingOn[chatId] = !fetchingOn[chatId];

  bot.sendMessage(chatId, message);
  console.log(message);
  return message;
};

const getStatus = (chatId: string) => {
  const message = `
Status for chatId ${chatId}: ${
    fetchingOn[chatId] !== undefined && detectingMotion[chatId] !== undefined ? `
\tFetching: ${fetchingOn[chatId]}
\tDetecting Motion: ${detectingMotion[chatId]}` :
      '\nError: make sure backend is pointing to node server'
    }
  `;
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

bot.onText(/\/status(.*)/, (msg: any) => {
  const chatId = msg.chat.id;
  getStatus(chatId);
});

app.get('/status', (req, res) => {
  const message = getStatus(req.query.chatId);
  res.send(message);
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
  const chatId = req.query.chatId;
  res.send(fetchingOn[chatId] ? 'true' : 'false');
});

app.post('/motion', (req, res) => {
  const chatId = req.query.chatId;
  if (!chatId) {
    console.error('Chat ID query param not found.');
    return;
  }

  if (!fetchingOn[chatId] && !detectingMotion[chatId]) {
    res.statusCode = 500;
    res.send('Motion detection is currently disabled');
    return;
  }

  const image = Buffer.from(req.body);

  if (image && fetchingOn[chatId] && req.query.idle) {
    fetchingOn[chatId] = false;
    bot.sendPhoto(chatId, image);
    return;
  } else if (image && !fetchingOn[chatId] && !req.query.idle) {
    bot.sendPhoto(chatId, image);
  }

  const message = `Motion detected at ${getTimestamp()} `;

  res.send(message);
  console.log(message);

  bot.sendMessage(chatId, message);
});

app.listen(port, () => console.log(`App is listening on port ${port} `));
