FROM codercom/code-server AS base

ARG VERSION=0.0.1

COPY ./config.yaml ./.config/code-server/config.yaml
COPY ./onlythemes-backend-helper/dist/ ./.local/share/code-server/extensions/builders-club.onlythemes-backend-helper-$VERSION/dist/
COPY ./onlythemes-backend-helper/package.json ./.local/share/code-server/extensions/builders-club.onlythemes-backend-helper-$VERSION/package.json

RUN sudo chown -hR $USER:$USER ./.config && sudo chown -hR $USER:$USER ./.local
