#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install node

cd /mf/application
FILE=/mf/application/node_modules
if test -d "$FILE"; then
    cd ./build
    # start faces watcher
    echo "starting the faces directory watcher"
    nohup ./watch_faces > ../logs/faces.log 2> ../logs/faces.error.log &
    cd ../
    # start uploads watcher
    echo "starting the uploads watcher service"
    nohup ./watch_uploads.py > ./logs/uploads.log 2> ./logs/uploads.error.log &
    # start rest server
    echo "application started ... visit http://localhost:8080 to access the web interface"
    node ./app.js > ./logs/face-match-rest.log 2> ./logs/face-match-rest.error.log

    exit 0
fi

# otherwise build the apps
./build-all-and-run.sh

