FROM node:14-alpine
ENV NODE_ENV production
ARG git_sha

WORKDIR /app
COPY . .
ENV GIT_SHA=${git_sha}
CMD ["node", "server/index.mjs"]
