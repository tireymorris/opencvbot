# opencvbot

Motion detection with OpenCV and Telegram bot interface

1. `sudo apt-get install python3 python3-pip python3-opencv xvfb && pip3 install virtualenv`
2. `git clone https://github.com/tireymorris/opencvbot`
3. `cd opencvbot && touch .env`
4. Open `.env` with your favorite editor and add the following:
   ```
   API_TOKEN=<todo>
   NODE_ENDPOINT=http://localhost:3001/motion?chatId=<todo>
   ```
5. `PATH=$PATH:~/.local/bin && virtualenv venv && source venv/bin/activate`
6. `pip3 install -r requirements.txt`
7. Message @botfather on telegram to create bot and use that `API_TOKEN` for .env file
8. `yarn install && yarn build && yarn start`
9. message your bot with `/subscribe` to get `NODE_ENDPOINT` for .env file
10. `python3 src/detect_motion.py` to run backend
