FROM node:14-alpine
ENV NODE_ENV production

WORKDIR usr/src/app
COPY server server/
COPY build build/

RUN npm install express
RUN npm install mustache-express

CMD ["node", "./server/server.mjs"]

EXPOSE 8080
