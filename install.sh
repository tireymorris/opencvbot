#!/bin/bash
 
sudo apt-get install python3 python3-pip python3-dev libatlas-base-dev libjasper-dev libqtgui4 python3-pyqt5 libilmbase-dev libopenexr23 libavcodec58 libavformat58 libswscale5 python3-opencv libqt4-test xvfb

pip3 install virtualenv
PATH=$PATH:~/.local/bin
virtualenv venv/
source venv/bin/activate
pip3 install -r requirements.txt
yarn install
yarn run build