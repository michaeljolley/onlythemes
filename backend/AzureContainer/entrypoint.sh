#!/usr/bin/env sh

# Ensure CODER is the owner of the .local folder and all assets within it
sudo chown -R $USER:$USER ~/.local
/usr/bin/code-server --install-extension $EXTENSION
/usr/bin/code-server --bind-addr 0.0.0.0:8080 . &
# Wait for the server to complete initialization
sleep .5
node ~/onlythemes/action.js
