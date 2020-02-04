#!/usr/local/bin/python

from imutils import face_utils
import numpy as np
import argparse
import imutils
import dlib
import cv2
import time
import os


# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-w", "--weights",
    help="path to facial landmark predictor", default="./weights/mmod_human_face_detector.dat")
ap.add_argument("-i", "--image", required=True,
    help="path to input image")
ap.add_argument("-m", "--method", default="HOG",
    help="method to use, default HOG, options [HOG, CNN]")

args = vars(ap.parse_args())
  
def getMethodColor(method="HOG"):
    colors = {
        "HOG" : (0,0,255),
        "CNN" : (0,255,0)
    }

    if method in colors:
        return  colors[method]

    return colors["CNN"]


def saveCropped(box, image, path, size = (150, 150)):
    ''' crop face box and save '''
    if hasattr(box, 'rect'):
        box = box.rect 
        
    x = box.left()
    y = box.top()
    w = box.right() - x
    h = box.bottom() - y

    w = h = max(w, h)
    # get the detected face for SIFT
    cropped = image[y:y+h, x:x+w]

    cropped = imutils.resize(cropped, width=size[0], height=size[1])

    cv2.imwrite(path, cropped)

    return x, y, w, h

def faceProcess(image, image_name, faces, method = "HOG"):
    
    path = "./output/cropped/{method}".format(method=method)
    os.makedirs(path, exist_ok=True)

    color = getMethodColor(method)

    image_name_ls = image_name.split(".")

    # loop over detected faces
    for (i, box) in enumerate(faces):
        cropped_output_path = "{path}/{image_name_ls[0]}-{i}.png".format(image_name_ls=image_name_ls, i=i + 1, path=path)
        # save cropped pieces
        x, y, w, h = saveCropped(box, image, cropped_output_path)
        # draw box over face
        cv2.rectangle(image, (x,y), (x+w,y+h), color, 2)

    # use blue to indicate that image marked using CNN
    _, img_width = image.shape[:2]
    cv2.putText(image, method, (img_width-50,40), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    color, 2)

    return image


def main():
    # load input image
    image = cv2.imread(args["image"])
    image = imutils.resize(image, width=800)
    # get the input image name
    image_name = args["image"].split("/")[-1]
    # weights file 
    weights = args["weights"]
  
    if image is None:
        print("Could not read input image")
        exit()

    if args["method"] == "CNN":    
        # initialize cnn based face detector with the weights
        cnn_face_detector = dlib.cnn_face_detection_model_v1(weights)
        # apply face detection (cnn)
        faces = cnn_face_detector(image, 1)
        out_image = faceProcess(image, image_name, faces, args["method"])
    else:
        detector = dlib.get_frontal_face_detector()
        faces = detector(image, 1)
        out_image = faceProcess(image, image_name, faces, args["method"])

    # save output image 
    cv2.imwrite("output/{method}-{image_name}.png".format(image_name=image_name, method=args["method"]), out_image)

    return 

if __name__=='__main__':
    main()
