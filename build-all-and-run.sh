#!/bin/bash

# build face metric models and face watcher 
echo "building the cpp binaries: face compare model and the faces compare model user. "
./build-cmake.sh > ./logs/build-cmake.log 2> ./logs/build-cmake.error.log

cd ./build

echo "training the model, It's gonna take a while, so why not make coffee, go out for a jog, visit grandma while the wizard does it's work .... :-)"
./dnn_mloi_train 

# start faces watcher
echo "========================== mode; training finished ======================"

echo "starting the faces directory watcher"
nohup ./watch_faces > ../logs/faces.log 2> ../logs/faces.log &

cd ../
# build the client application
echo "building the client application, will be accessible on http://localhost:6006"
./build-client.sh > ./logs/build-client.log 2> ./logs/build-client.error.log 

# install python required packages
echo "installing python required packages"
pip install -r requirements.txt > ./logs/install_py_reqs.log 2> ./logs/install_py_reqs.error.log

# install rest dependencies
echo "installing rest server dependencies"
npm install > ./logs/install_rest_deps.log 2> ./logs/install_rest_deps.error.log

# start uploads watcher
echo "starting the uploads watcher service"
nohup ./watch_uploads.py > ./logs/uploads.log 2> ./logs/uploads.error.log &

# start rest server
echo "already there, starting the rest server"
nohup node ./app.js > ./logs/face-match-rest.log 2> ./logs/face-match-rest.error.log &

# see running processes started by script

echo "if 3 services with PID show, congratulations, service is up. Go to http://localhost:6006 and play around. Upload wild images, and then some nice targets, select targets to view where faces from target images would have been found in wild images"
echo $(ps aux | grep watch_uploads)
echo $(ps aux | grep node)
echo $(ps aux | grep watch_faces)