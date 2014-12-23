FROM node:0.10.34
MAINTAINER YANKE Guo<me@yanke.io>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install

COPY ./lib /usr/src/app/lib
COPY ./index.js /usr/src/app/index.js

CMD [ "npm", "start" ]
