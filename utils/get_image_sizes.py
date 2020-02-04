#!/usr/local/bin/python

import argparse
import cv2

# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-i", "--image", required=True,
    help="path to input image")
args = vars(ap.parse_args())


def main():
    # load input image
    image = cv2.imread(args["image"])
    height, width, channels = image.shape

    print(height, width, channels)
    
if __name__=='__main__':
    main()