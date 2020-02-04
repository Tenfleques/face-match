#!/usr/local/bin/python

from imutils import face_utils
import numpy as np
import argparse
import imutils
import dlib
import cv2
from utils.carve import rect_to_bb, shape_to_np


# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-w", "--weights",
    help="path to facial landmark predictor", default="./weights/shape_predictor_68_face_landmarks.dat")
ap.add_argument("-i", "--image", required=True,
    help="path to input image")
args = vars(ap.parse_args())


# initialize dlib's face detector (HOG-based) and then create
# the facial landmark predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(args["weights"])

# load the input image, resize it, and convert it to grayscale
image = cv2.imread(args["image"])
image = imutils.resize(image, width=500)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# get the input image name
image_name = args["image"].split("/")[-1]

# detect faces in the grayscale image
rects = detector(gray, 1)

print(rects)

# loop over the face detections
for (i, rect) in enumerate(rects):
	# determine the facial landmarks for the face region, then
	# convert the facial landmark (x, y)-coordinates to a NumPy
	# array
    shape = predictor(gray, rect)
    shape = face_utils.shape_to_np(shape)


	# convert dlib's rectangle to a OpenCV-style bounding box
	# [i.e., (x, y, w, h)], then draw the face bounding box
    (x, y, w, h) = face_utils.rect_to_bb(rect)

    # get the detected face for SIFT
    cropped = image[y:y+h, x:x+w]
    cropped_output_name = "./output/cropped-{i}-{image_name}".format(image_name=image_name, i=i + 1)

    cv2.imwrite(cropped_output_name, cropped)

    # draw the bounding box on the image
    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)


	# # show the face number
    cv2.putText(image, "Face #{}".format(i + 1), (x - 10, y - 10),
		cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

# # show the output image with the face detections + facial landmarks
cv2.imwrite("./output/{image_name}".format(image_name = image_name), image)