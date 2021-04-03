import { promises as fs } from 'fs'
import * as path from 'path'
import { parse } from 'comment-json'
import axios from 'axios'

import { parse as plistparse } from './vscode/plistParser'
import { ITextMateThemingRule, IColorMap } from './vscode/workbenchThemeService'
import { convertSettings } from './vscode/themeCapability'

export const saveTheme = async (extensionDir: string, manifestTheme: any) => {

  const themePath = path.join(`/home/coder/.vscode/extensions/${extensionDir}/`, manifestTheme.path);

  const themeData = await fs.readFile(themePath, { encoding: 'utf-8' });

  if (path.extname(manifestTheme.path) === '.json') {
    const rawTheme = parse(themeData.toString());

    // format that JSON to match the TypeScript model for Theme
    const theme = {
      name: rawTheme.name,
      colors: rawTheme.colors,
      tokenColors: rawTheme.tokenColors,
      semanticHighlighting: rawTheme.semanticHighlighting,
      extensionId: process.env.EXTENSION,
      imageCaptured: false
    };

    // save that object to CosmosDb
    return await _saveTheme(theme);
  } else { // theme data is a plist of info
    const plist = plistparse(themeData)
    let settings: ITextMateThemingRule[] = plist.settings
    if (!Array.isArray(settings)) {
      return Promise.reject(new Error("error.plist.invalidFormat"))
    }
    let result: { textMateRules: ITextMateThemingRule[], colors: IColorMap, imageCaptured: boolean } = {
      textMateRules: [],
      colors: {},
      imageCaptured: false
    };
    convertSettings(settings, result)
    return await _saveTheme(result)
  }

}

const _saveTheme = async (theme: any) => {
  const response = await axios.post(`${process.env.FUNCTIONS_URL}ThemeUpsert`, { theme });
  return response.data;
}

export default saveTheme;