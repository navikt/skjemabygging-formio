FROM node:14-alpine
# RUN apk add --no-cache bash
ENV NODE_ENV production

WORKDIR usr/src/app
COPY server.mjs .
COPY build build/

RUN npm install express

CMD ["node", "./server.mjs"]

EXPOSE 8080
