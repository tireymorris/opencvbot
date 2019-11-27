#!/bin/bash

yarn start &
source venv/bin/activate
xvfb-run python3 src/detect_motion.py
