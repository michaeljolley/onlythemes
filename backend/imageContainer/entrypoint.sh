#!/usr/bin/env bash

# Install the theme extension and run the server
/usr/bin/code --install-extension $EXTENSION
/usr/bin/code-server --bind-addr 0.0.0.0:8080 . &


# Wait for the server to complete initialization
sleep 2
node ~/onlythemes/app/start.js