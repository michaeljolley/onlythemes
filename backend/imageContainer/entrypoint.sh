#!/usr/bin/env bash

# Install the theme extension and run the server
/usr/bin/code --install-extension $EXTENSION
/usr/bin/code-server --bind-addr 0.0.0.0:8080 . &

# Loop through the available themes within the extension
export PLACEHOLDER="ONLYTHEME_PLACEHOLDER"
IFS=";" read -ra THEMES_ARRAY string <<< "$THEME"
for t in "${THEMES_ARRAY[@]}"
do
  export THEME=$t
  # Replace our placehodler in the VSCODE USER SETTINGS to our theme
  sed -ir "s/$PLACEHOLDER/$THEME/" ~/.local/share/code-server/User/settings.json
  export PLACEHOLDER=$THEME
  # Wait for the server to complete initialization
  sleep .5
  node ~/onlythemes/action.js
done
