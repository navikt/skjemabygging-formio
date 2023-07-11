FROM node:18.16.1-alpine
ENV NODE_ENV production
ENV SKJEMA_DIR /app/skjema/
ENV RESOURCES_DIR /app/resources/
ENV TRANSLATION_DIR /app/translation/
WORKDIR /app

ARG git_sha
ARG monorepo_git_sha
ARG skjema_dir
ARG resources_dir
ARG translation_dir

COPY build build
COPY server/dist server
COPY server/fonts server/fonts
COPY server/node_modules server/node_modules
COPY $skjema_dir/ $SKJEMA_DIR
COPY $resources_dir/ $RESOURCES_DIR
COPY $translation_dir/ $TRANSLATION_DIR

ENV GIT_SHA=${git_sha}
ENV MONOREPO_GIT_SHA=${monorepo_git_sha}
WORKDIR server
CMD ["node", "server.mjs"]

EXPOSE 8080
