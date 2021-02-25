FROM node:14-alpine
ENV NODE_ENV production

WORKDIR usr/src/app
COPY . ./

WORKDIR ../
CMD ["node", "server/index.mjs"]