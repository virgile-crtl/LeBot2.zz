FROM node:latest

WORKDIR /lebot2.zz

COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY eslint.config.ts ./
COPY src ./src/
COPY locales ./locales/

RUN apt-get -y upgrade
RUN apt-get -y update
RUN apt-get install -y ffmpeg

RUN  npm install