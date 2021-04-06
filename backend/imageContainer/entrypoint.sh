#!/usr/bin/env bash

echo $EXTENSION

# Install the theme extension and run the server
/usr/share/code/bin/code --install-extension $EXTENSION
/usr/bin/code-server --bind-addr 0.0.0.0:8080 . &

# Wait for the server to complete initialization
sleep 2
cd ~/onlythemes
npm run start