import axios from 'axios';
import { promises as fs } from 'fs';
import { parse } from 'comment-json';

import screenshot from './screenshot';
import saveTheme from './saveTheme';

let extensionDir = '';

const deleteCI = async () => {
  await axios.post(`${process.env.FUNCTIONS_URL}DeleteCI`, { containerInstanceId: process.env.CONTAINER_INSTANCE })
}

const loadManifest = async () => {
  const manifestData = await fs.readFile(`/home/coder/.vscode/extensions/${extensionDir}/package.json`);
  return parse(manifestData.toString());
}

const setTheme = async (themeLabel: string) => {
  console.log(themeLabel);
  await fs.writeFile('/home/coder/.local/share/code-server/User/settings.json', `{\
    "workbench.colorTheme": "${themeLabel}"\
  }`);
}

const updateExtension = async () => {
  await axios.get(`${process.env.FUNCTIONS_URL}ExtensionCataloged?extensionId=${process.env.EXTENSION_ID}`);
}

const recordError = async (error: any) => {
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

          try {
            await screenshot(theme.id);
          }
          catch (err) {
            await recordError(`screenshot: ${err}`);
            throw (err)
          }
  
          console.log(`Saved ${theme.name}`);
        }
        catch (err) {
          await recordError(`saveTheme: ${err}`);
          throw (err)
        }
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