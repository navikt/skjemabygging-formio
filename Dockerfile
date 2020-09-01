FROM node:14-alpine
ENV NODE_ENV production

WORKDIR usr/src/app
COPY server server/
COPY build build/

WORKDIR server
RUN npm ci

CMD ["node", "./server.mjs"]

EXPOSE 8080
