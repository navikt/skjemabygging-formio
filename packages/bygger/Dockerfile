FROM node:14.17.0-alpine
ENV NODE_ENV production

WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "server/index.mjs"]