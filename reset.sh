#!/bin/bash
# reset the network. Delete all the uploaded images and the faces and the json log

rm ./images/uploads/wild/*
rm ./images/uploads/target/*
rm ./images/faces/wild/*
rm ./images/faces/target/*
rm ./rest/metrics/overall.json