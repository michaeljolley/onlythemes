#!/usr/bin/env sh

# Replace our placehodler in the VSCODE USER SETTINGS to our theme
sed -i 's/ONLYTHEME_PLACEHOLDER/'$THEME'/' ~/.local/share/code-server/User/settings.json
/usr/bin/code-server --install-extension $EXTENSION
/usr/bin/code-server --bind-addr 0.0.0.0:8080 . &
# Wait for the server to complete initialization
sleep .5
node ~/onlythemes/action.js
