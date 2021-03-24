const axios = require('axios');
const fs = require('fs').promises;
const { parse } = require('comment-json');

const screenshot = require('./screenshot');
const saveTheme = require('./saveTheme');

let extensionDir = '';

const deleteCI = async () => {
  await axios.post(`${process.env.FUNCTIONS_URL}DeleteCI`, { containerInstanceId: process.env.CONTAINER_INSTANCE })
}

const loadManifest = async () => {
  const manifestData = await fs.readFile(`/home/coder/.vscode/extensions/${extensionDir}/package.json`);
  return parse(manifestData.toString());
}

const setTheme = async (themeLabel) => {
  await fs.writeFile('/home/coder/.local/share/code-server/User/settings.json', `{\
    "workbench.colorTheme": "${themeLabel}"\
  }`);
}

const updateExtension = async (extensionId) => {
  await axios.get(`${process.env.FUNCTIONS_URL}ExtensionCataloged?extensionId=${process.env.EXTENSION_ID}`);
}

const main = async () => {
  try {

    const extensionDirs = await fs.readdir('/home/coder/.vscode/extensions');
    extensionDir = extensionDirs[0];

    // Load the manifest
    const manifest = await loadManifest();

    if (manifest && manifest.contributes.themes) {
      // for each theme in manifest
      for (const manifestTheme of manifest.contributes.themes) {

        await setTheme(manifestTheme.label);

        const theme = await saveTheme(extensionDir, manifestTheme);

        await screenshot(theme.id);

        console.log(`Saved ${theme.name}`);

      }
    }

    await updateExtension();
  }
  catch (err) {
    console.log(err);
  }
  await deleteCI();
}

main();