#!/usr/local/bin/python

from imutils import face_utils
import numpy as np
import argparse
import imutils
import dlib
import cv2
import time


# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-w", "--weights",
    help="path to facial landmark predictor", default="./weights/mmod_human_face_detector.dat")
ap.add_argument("-i", "--image", required=True,
    help="path to input image")

args = vars(ap.parse_args())

# load input image
image = cv2.imread(args["image"])

# get the input image name
image_name = args["image"].split("/")[-1]

if image is None:
    print("Could not read input image")
    exit()

# initialize cnn based face detector with the weights
cnn_face_detector = dlib.cnn_face_detection_model_v1(args["weights"])

# apply face detection (cnn)
faces_cnn = cnn_face_detector(image, 1)

# loop over detected faces
for face in faces_cnn:
    x = face.rect.left()
    y = face.rect.top()
    w = face.rect.right() - x
    h = face.rect.bottom() - y

    # draw box over face
    cv2.rectangle(image, (x,y), (x+w,y+h), (0,0,255), 2)

# use red to indicate that image marked using CNN
img_height, img_width = image.shape[:2]
cv2.putText(image, "CNN", (img_width-50,40), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                (0,0,255), 2)

# save output image 
cv2.imwrite("output/cnn-{image_name}.png".format(image_name=image_name), image)