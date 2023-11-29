##FROM node:20 AS build
FROM node:alpine
WORKDIR /app

COPY package.json ./

RUN npm install
COPY . ./
RUN npm run build

CMD node build
