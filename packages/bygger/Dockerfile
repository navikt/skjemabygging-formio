FROM node:14.17.0-alpine
ENV NODE_ENV production
ARG git_sha

WORKDIR /app
COPY . .
ENV GIT_SHA=${git_sha}
CMD ["node", "server/index.mjs"]
