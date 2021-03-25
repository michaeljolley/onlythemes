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
  console.log(themeLabel);
  await fs.writeFile('/home/coder/.local/share/code-server/User/settings.json', `{\
    "workbench.colorTheme": "${themeLabel}"\
  }`);
}

const updateExtension = async (extensionId) => {
  await axios.get(`${process.env.FUNCTIONS_URL}ExtensionCataloged?extensionId=${process.env.EXTENSION_ID}`);
}

const recordError = async (error) => {
  await axios.post(`${process.env.FUNCTIONS_URL}ExtensionError`, {
    extensionId: process.env.EXTENSION_ID,
    error
  });
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

        try {
          await setTheme(manifestTheme.label);
        }
        catch (err) {
          await recordError(`setTheme: ${err}`);
          throw (err)
        }

        try {
          const theme = await saveTheme(extensionDir, manifestTheme);
        }
        catch (err) {
          await recordError(`saveTheme: ${err}`);
          throw (err)
        }

        try {
          await screenshot(theme.id);
        }
        catch (err) {
          await recordError(`screenshot: ${err}`);
          throw (err)
        }

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