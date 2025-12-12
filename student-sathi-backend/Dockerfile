FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci 

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
