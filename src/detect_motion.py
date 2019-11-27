from imutils.video import VideoStream
import argparse
import cv2
import datetime
from dotenv import load_dotenv
import imutils
import os
import requests
import time

load_dotenv()

ap = argparse.ArgumentParser()
ap.add_argument('-v', '--video', help='video file path')
ap.add_argument('-a', '--min-area', type=int,
                default=2000, help='minimum area size')
ap.add_argument('-r', '--reset-interval', type=int,
                default=5, help='frame interval between initial frame resets')
args = vars(ap.parse_args())

if args.get('video', None) is None:
    vs = VideoStream(src=0, resolution=(640, 480), framerate=24).start()
    time.sleep(2.0)
else:
    vs = cv2.VideoCapture(args['video'])

initial_frame = None
frame_counter = 0
reset_interval = args['reset_interval']
notified_during_interval = False

while True:
    frame = vs.read()
    frame = frame if args.get('video', None) is None else frame[1]

    if frame is None:
        break

    frame = imutils.resize(frame, width=500)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # smoothing to average pixel intensities across an 21 x 21 region
    # some pixels will most certainly have different intensity values between consecutive frames
    gray = cv2.GaussianBlur(gray, (21, 21), 0)

    if initial_frame is None or (frame_counter == reset_interval):
        initial_frame = gray
        frame_counter = 0
        notified_during_interval = False
        continue

    # compute the absolute difference between the current frame and
    # first frame
    frame_delta = cv2.absdiff(initial_frame, gray)
    thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]

    # dilate the thresholded image to fill in holes, then find contours
    # on thresholded image
    thresh = cv2.dilate(thresh, None, iterations=2)
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
                            cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)

    visible_shapes = list(filter(lambda c: cv2.contourArea(c)
                                 >= args['min_area'], cnts))

    if (len(visible_shapes) > 0 and not notified_during_interval):
        try:
            requests.post(os.getenv('NODE_ENDPOINT'),
                          cv2.imencode('.jpg', frame)[1].tostring(),
                          headers={'Content-Type': 'application/octet-stream'})
            notified_during_interval = True
        except requests.exceptions.ConnectionError:
            print('Motion detected, but could not hit node endpoint')
    # compute the bounding box for the contour, draw it on the frame,
    # and update the text
    for c in cnts:
        # if the contour is too small, ignore it
        if cv2.contourArea(c) < args['min_area']:
            continue
        (x, y, w, h) = cv2.boundingRect(c)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    cv2.putText(frame, datetime.datetime.now().strftime('%A %d %B %Y %I:%M:%S%p'),
                (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)

    cv2.imshow('Security Feed', frame)
    cv2.imshow('Thresh', thresh)
    cv2.imshow('Frame Delta', frame_delta)
    key = cv2.waitKey(1) & 0xFF
    cv2.imshow('Frame Delta', frame_delta)

    if key == ord('q'):
        break

    frame_counter += 1

vs.stop() if args.get('video', None) is None else vs.release()
cv2.destroyAllWindows()
