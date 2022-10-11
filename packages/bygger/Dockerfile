FROM node:16.17.1-alpine
ENV NODE_ENV production
ARG git_sha

WORKDIR /app
COPY build build
COPY server/dist server
COPY server/node_modules server/node_modules

ENV GIT_SHA=${git_sha}
WORKDIR server
CMD ["node", "server.js"]
