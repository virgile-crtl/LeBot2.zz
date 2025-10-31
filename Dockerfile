FROM node:latest

WORKDIR /lebot2.zz

COPY package*.json ./

COPY tsconfig.json .
COPY ./src ./src
COPY ./locales ./locales
COPY ./playlists ./playlists

RUN apt-get -y upgrade
RUN apt-get -y update
RUN apt-get install -y ffmpeg

RUN  npm install && npm run build
CMD ["npm", "run", "start"]
