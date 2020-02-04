#!/usr/local/bin/python

import time
import os
from watchdog.events import FileSystemEventHandler
from facetools import (carve_faces, watch)
import psutil


class Handler(FileSystemEventHandler):

    @staticmethod
    def on_any_event(event):
        valid_exts = ["png", "jpg", "jpeg"]

        if event.is_directory:
            return None

        elif event.event_type == 'created':
            if event.src_path.split(".")[-1].lower() in valid_exts:
                output_path = "/".join(event.src_path.split("/")[:-1]).replace("uploads", "faces")

                out_paths = carve_faces.carveFaces(event.src_path, output_path, "HOG")
                # if len (out_paths):
                #     os.remove(event.src_path)


if __name__ == '__main__':
    w = watch.Watcher("./images/uploads", Handler())
    w.run()