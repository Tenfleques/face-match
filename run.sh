#!/bin/bash

cd ./build
# start faces watcher
echo "starting the faces directory watcher"
nohup ./watch_faces > ../logs/faces.log 2> ../logs/faces.error.log &
cd ../
# start uploads watcher
echo "starting the uploads watcher service"
nohup ./watch_uploads.py > ./logs/uploads.log 2> ./logs/uploads.error.log &
# start rest server
echo "starting the rest server"
nohup node ./app.js > ./logs/face-match-rest.log 2> ./logs/face-match-rest.error.log &

# see running processes started by script

echo "if 3 services with PID show, congratulations, service is up. Go to http://localhost:6006 and play around. Upload wild images, and then some nice targets, select targets to view where faces from target images would have been found in wild images"

echo $(ps aux | grep watch_uploads)
echo $(ps aux | grep node)
echo $(ps aux | grep watch_faces)