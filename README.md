# Face Matching app

This is a light application to detect faces in images and match faces in pictures.

## Dependencies

Docker

## Automated build and/or start 

use this command to build all the dependencies and start the respective services and start the front end accessible at http://localhost:8080. 

you can make edits to suit your needs in the *.sh files. 

```bash
./init.sh .
```

or do it step by step:

## Build the container

```bash
./build-container.sh .
```

### get the interactive container terminal

```bash
docker exec -it mf-loc /bin/bash
```

### from inside the container navigate to the project folder

```bash
cd /mf/application/
```

## Compile the application

## Compiling and running the application

For first time usage run this command. It will build and install all required dependencies

```bash
./build-all-run.sh .
```

## Run the application 
otherwise just run 

```bash
./run.sh .
```


