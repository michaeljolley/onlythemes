const axios = require('axios');
const fs = require('fs');
const { parse } = require('comment-json');

const screenshot = require('./screenshot');
const saveTheme = require('./saveTheme');

const deleteCI = async () => {
  await axios.post(`${process.env.FUNCTIONS_URL}DeleteCI`, { containerInstanceId: process.env.CONTAINER_INSTANCE })
}

const loadManifest = () => {
  return parse(fs.readFileSync(`/home/coder/.vscode/extensions/${process.env.EXTENSION}/extension/package.json`).toString());
}

const setTheme = (themeLabel) => {
  fs.writeFileSync('/.local/share/code-server/User/settings.json', `{\
    "workbench.colorTheme": "${themeLabel}"\
  }`);
}

const main = async () => {
  try {

    // Load the manifest
    const manifest = await loadManifest();

    if (manifest && manifest.contributes.themes) {
      // for each theme in manifest
      for (const manifestTheme of manifest.contributes.themes) {

        setTheme(manifestTheme.label);

        const theme = await saveTheme(manifestTheme);

        await screenshot(theme.id);
      }
    }
  }
  catch (err) {

  }
  await deleteCI();
}

main();