FROM node:14-alpine
ENV NODE_ENV production

WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "server/index.mjs"]

