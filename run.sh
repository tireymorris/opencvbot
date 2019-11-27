#!/bin/bash

yarn build && yarn start &  source venv/bin/activate && nohup xvfb-run python3 src/detect_motion.py &