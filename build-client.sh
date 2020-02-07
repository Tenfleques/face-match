#!/bin/bash
cd /mf/application

cd client

# install client dependencies
echo "installing client app dependencies"
npm install > ../logs/client_deps_install.log 2> ../logs/client_deps_install.error.log

# build client app
npm run build > ../logs/client_build.log 2> ../logs/client_build.error.log
node after-install 