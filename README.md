# opencvbot

Motion detection with OpenCV and Telegram bot interface

1. `sudo apt-get install python3 python3-pip python3-opencv xvfb && pip3 install virtualenv`
2. clone https://github.com/tireymorris/opencvbot
3. cd into repo and create .env file with `API_TOKEN=<todo>` and `NODE_ENDPOINT=http://localhost:3001/motion?chatId=<todo>` variables
4. Do `virtualenv venv` and `source venv/bin/activate`
5. `pip3 install -r requirements.txt`
6. Message botfather on telegram to create bot and use that `API_TOKEN` for .env file
7. `yarn install && yarn build && yarn start`
8. message your bot with `/subscribe` to get `NODE_ENDPOINT` for env file
9. `python3 src/detect_motion.py` to run backend
