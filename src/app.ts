import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();
const app = express();
app.use(bodyParser.raw());
const port = process.env.PORT || 3001;
const token = process.env.API_TOKEN;

if (!token) {
  console.error('API token not found. Please pass API_TOKEN environment variable');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
bot.onText(/\/subscribe(.*)/, (msg: any) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Affirmativo hombre - use endpoint '/motion?chatId=${chatId}' to run motion detection code.`);
});

app.post('/motion', (req, res) => {
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
