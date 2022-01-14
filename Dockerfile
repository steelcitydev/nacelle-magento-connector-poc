FROM keymetrics/pm2:latest-alpine

RUN npm install -g pm2 dotenv esm

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3000 9615

CMD ["pm2-runtime", "start", "./pm2.yml"]
