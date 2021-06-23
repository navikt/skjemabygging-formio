FROM ubuntu
ARG SELF_HOSTED_RUNNER_TOKEN

RUN echo $SELF_HOSTED_RUNNER_TOKEN

RUN apt-get update && apt-get install -y curl && useradd -m docker

RUN mkdir /action-runner
WORKDIR /action-runner
# Download the latest runner package
RUN curl -O -L https://github.com/actions/runner/releases/download/v2.277.1/actions-runner-linux-x64-2.277.1.tar.gz
# Extract the installer
RUN tar xzf ./actions-runner-linux-x64-2.277.1.tar.gz

RUN ./bin/installdependencies.sh
USER docker
RUN ./config.sh --url https://github.com/navikt/skjemabygging-formio --token $SELF_HOSTED_RUNNER_TOKEN

CMD "./run.sh"