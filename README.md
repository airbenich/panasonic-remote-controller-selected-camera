# Panasonic Remote Controller – Selected Camera
Get the selected Camera from the Panasonic AW-RP150 and send Commands to Companion.
Also offer a websocket connection with a broadcast of the current selected camera.
 
## Deploy as docker container
Build docker image from Dockerfile:

`docker build -t panasonic-remote-controller-selected-camera ./`

Show all docker images:

`docker images`

Save docker image to file:

`docker save -o ../panasonic-remote-controller-selected-camera.tar panasonic-remote-controller-selected-camera`

### Deploy to docker host machine (e.g. Synology NAS)
* Transfer file to docker host machine
* stop old container
* remove old image
* add new image
* start image as container and route port 3000 and 62000 in port settings