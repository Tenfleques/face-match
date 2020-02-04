#!/usr/local/bin/python

from imutils import face_utils
import numpy as np
import argparse
import imutils
import dlib
import cv2
import time
import os
# import PIL
# from io import StringIO
# import magic
import psutil


def saveCropped(box, image, path, size = (150, 150)):
    ''' crop face box and save '''
    if hasattr(box, 'rect'):
        box = box.rect 
        
    x = box.left()
    y = box.top()
    w = box.right() - x
    h = box.bottom() - y

    # add box params to face image file
    path += "-{x}-{y}-{w}-{h}.png".format(x=x, y=y, w=w, h=h)

    # equate width and height to save cube
    w = h = max(w, h)

    # get the detected face box
    cropped = image[y:y+h, x:x+w]

    cropped = imutils.resize(cropped, width=size[0], height=size[1])

    cv2.imwrite(path, cropped)

    return path

def faceProcess(image, image_name, faces, output_path):
    os.makedirs(output_path, exist_ok=True)

    paths = []
    # loop over detected faces
    for (i, box) in enumerate(faces):
        cropped_output_path = "{output_path}/{image_name}-{i}".format(image_name=image_name, i=i + 1, output_path=output_path)
        # save cropped pieces
        p = saveCropped(box, image, cropped_output_path)

        paths.append(p)

    return paths

def carveFaces(image_file, output_path, method="HOG", weights=""):
    # load input image
    # image = cv2.imread(image_file)
    image = None
    # m = magic.Magic(mime_encoding=True)
    i_arr = image_file.split("/")
    rel_name = "/".join(i_arr[len(i_arr) - 3:])

    while True:
        wait_please = False
        for proc in psutil.process_iter():
            open_files = proc.open_files()
            if len(open_files):
                p_fs =  ["/".join(fp[0].split("/")[-3:]) for fp in open_files]
                if rel_name in p_fs:
                    wait_please = True
                    time.sleep(2)
        if not wait_please:
            break
                       
        # with open(image_file, 'rb') as image_bin:
            # image = cv2.imread(image_file)
            # blob = image_bin.read()  
            # encoding = m.from_buffer(blob)
            # buff = StringIO()            
            # buff.write(blob.decode(encoding))
            # buff.seek(0)
            # temp_image = np.array(PIL.Image.open(buff), dtype=np.uint8)
            # image = cv2.cvtColor(temp_image, cv2.COLOR_RGB2BGR)

        # if image is not None:
        #     break
    
    image = cv2.imread(image_file)

    if image is None:
        print("Could not read input image")
        return

    image = imutils.resize(image, width=800)
    # get the input image name
    image_name = image_file.split("/")[-1]
    

    if method == "CNN":    
        # initialize cnn based face detector with the weights
        cnn_face_detector = dlib.cnn_face_detection_model_v1(weights)
        # apply face detection (cnn)
        faces = cnn_face_detector(image, 1)
        out_paths = faceProcess(image, image_name, faces, output_path)
    else:
        detector = dlib.get_frontal_face_detector()
        faces = detector(image, 1)
        out_paths = faceProcess(image, image_name, faces, output_path)

    return out_paths

def main():
    # construct the argument parser and parse the arguments
    ap = argparse.ArgumentParser()
    ap.add_argument("-w", "--weights",
        help="path to facial landmark predictor", default="./weights/mmod_human_face_detector.dat")
    ap.add_argument("-i", "--image", required=True,
        help="path to input image")
    ap.add_argument("-m", "--method", default="HOG",
        help="method to use, default HOG, options [HOG, CNN]")
    ap.add_argument("-o", "--output", default="",
        help="path to output images")

    args = vars(ap.parse_args())

    image_file = args["image"]
    # weights file 
    weights = args["weights"]
    # method to use
    method = args["method"]
    # output path
    output_path = args["output"]

    carveFaces(image_file, output_path, method, weights)

if __name__=='__main__':
    main()
