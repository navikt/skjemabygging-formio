FROM node:14-alpine
ENV NODE_ENV production

WORKDIR usr/src/app/server
COPY server ./
RUN npm ci

WORKDIR ../
COPY build build/

CMD ["node", "./server/server.mjs"]

EXPOSE 8080
