#!/bin/bash

yarn start &
source venv/bin/activate
python3 src/detect_motion.py
