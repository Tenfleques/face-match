#!/usr/local/bin/python

import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from facetools import carve_faces


class Watcher:

    def __init__(self, directory, Handler):
        self.observer = Observer()
        self.DIRECTORY_TO_WATCH = directory
        self.Handler = Handler

    def run(self):
        event_handler = self.Handler
        self.observer.schedule(event_handler, self.DIRECTORY_TO_WATCH, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except:
            self.observer.stop()
            print()
            print ("Stopped")

        self.observer.join()