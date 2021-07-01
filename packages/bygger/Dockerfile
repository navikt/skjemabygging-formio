FROM node:14.17.0-alpine
ENV NODE_ENV production
ARG git_sha

WORKDIR /app
COPY build build
COPY server server
ENV GIT_SHA=${git_sha}

WORKDIR server
CMD ["node", "index.mjs"]
