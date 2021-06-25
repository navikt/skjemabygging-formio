FROM node:14.17.0-alpine
ENV NODE_ENV production

WORKDIR usr/src/app/server
COPY server ./
RUN npm ci

WORKDIR ../
COPY build build/

WORKDIR server
CMD ["npm", "run", "start-prod"]

EXPOSE 8080
