#!/bin/bash
name="mf-loc"
con=$(docker container ls -a -f name=${name} -q)
img=$(docker image ls | grep ${name})
dir=$(pwd)

[[ ! -z  $con  ]] && docker start -ia ${name} &&  exit 0

[[ ! -z  $img  ]] && docker run -it -p 8080:8080 -v $dir:/mf/application --cap-add SYS_ADMIN --device /dev/fuse --name ${name} ${name}:latest /mf/application/run.sh && exit 0

docker build --rm -f "Dockerfile" -t ${name}:latest .

# create the docker image for the first time, build everything  :-)
docker run -it -p 8080:8080 -v $dir:/mf/application --cap-add SYS_ADMIN --device /dev/fuse --name ${name} ${name}:latest /mf/application/run.sh
