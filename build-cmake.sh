#!/bin/bash
cd /mf/application

mkdir build
cd build
cmake ..
cmake --build .