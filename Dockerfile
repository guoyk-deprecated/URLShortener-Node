FROM node:0.10.34
MAINTAINER YANKE Guo<me@yanke.io>

RUN npm install -g forever && npm cache clear

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install

COPY ./lib /usr/src/app/lib
COPY ./index.js /usr/src/app/index.js

CMD forever --minUptime 1000 --spinSleepTime 1000 index.js
