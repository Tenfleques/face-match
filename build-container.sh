#!/bin/bash
name="tf-loc"
con=$(docker container ls -a -f name=${name} -q)
img=$(docker image ls | grep ${name})
dir=$(pwd)

[[ ! -z  $con  ]] && docker start -ia ${name} &&  exit 0

[[ ! -z  $img  ]] && docker run -it -p 8888:8888 -p 6006:6008 -v $dir:/tf/tendai --cap-add SYS_ADMIN --device /dev/fuse --name ${name} ${name}:latest && exit 0

docker build --rm -f "Dockerfile" -t ${name}:latest .

docker run -it -p 8888:8888 -p 6006:6008 -v $dir:/tf/tendai --cap-add SYS_ADMIN --device /dev/fuse --name ${name} ${name}:latest
