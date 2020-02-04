#!/usr/local/bin/python3
import argparse
import cv2

parser = argparse.ArgumentParser(description='video frames extrator')
parser.add_argument('-v', '--video', type=str, help='required path to video')
parser.add_argument('-o', '--output', type=str, help='required path to output')

def main():
    args = parser.parse_args()

    vidcap = cv2.VideoCapture(args.video)
    success,image = vidcap.read()
    count = 0
    while success:
        cv2.imwrite("frame%d.jpg" % count, image)     # save frame as JPEG file      
        success,image = vidcap.read()
        print('Read a new frame: ', success)
        count += 1