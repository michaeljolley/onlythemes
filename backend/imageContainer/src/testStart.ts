import { promises as fs } from 'fs';
import { parse } from 'comment-json';
import * as path from 'path';

import { parse as plistparse } from './vscode/plistParser'
import { ITextMateThemingRule, IColorMap } from './vscode/workbenchThemeService'
import { convertSettings } from './vscode/themeCapability'

const loadManifest = async () => {
  const dir = path.join(path.resolve(), "/test/package.json")
  const manifestData = await fs.readFile(dir, { encoding: 'utf-8' })
  return parse(manifestData);
}

const main = async () => {
  const manifest = await loadManifest()
  if (manifest) {
    for (const manifestTheme of manifest.contributes.themes) {
      console.log(`Working on '${manifestTheme.label}'`)
      const themeDataPath = path.join(path.resolve(), "/test", manifestTheme.path)
      const themeData = await fs.readFile(themeDataPath, { encoding: 'utf-8' })
      const plist = plistparse(themeData)
      if (path.extname(manifestTheme.path) === '.json') {
        // do normal color parsing     
      }
      else {
        let settings: ITextMateThemingRule[] = plist.settings;
        if (!Array.isArray(settings)) {
          return Promise.reject(new Error("error.plist.invalidformat"))
        }
        let result: { textMateRules: ITextMateThemingRule[], colors: IColorMap } = {
          textMateRules: [],
          colors: {}
        };
        convertSettings(settings, result)
        console.dir(result.colors);
      }
    }
  }
}

main()
