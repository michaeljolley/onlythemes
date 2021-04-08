import { promises as fs } from 'fs'
import * as path from 'path'
import { parse } from 'comment-json'
import axios from 'axios'
const Color = require('color2');

import { parse as plistparse } from './vscode/plistParser'
import { ITextMateThemingRule, IColorMap } from './vscode/workbenchThemeService'
import { convertSettings } from './vscode/themeCapability'

export const saveTheme = async (extensionDir: string, manifestTheme: any) => {

  const themePath = path.join(`/home/coder/.vscode/extensions/${extensionDir}/`, manifestTheme.path);

  const themeData = await fs.readFile(themePath, { encoding: 'utf-8' });

  const theme = {
    name: manifestTheme.label,
    extensionId: process.env.EXTENSION_ID,
    extensionName: process.env.EXTENSION,
    imageCaptured: false,
    colors: {
      editorBackground: undefined,
      editorForeground: undefined,
      foreground: undefined,
      activityBarBackground: undefined,
      activityBarForeground: undefined,
      sideBarBackground: undefined,
      sideBarForeground: undefined,
      editorGroupHeaderNoTabsBackground: undefined,
      editorGroupHeaderTabsBackground: undefined,
      statusBarBackground: undefined,
      statusBarForeground: undefined,
      titleBarActiveBackground: undefined,
      titleBarActiveForeground: undefined,
      menuForeground: undefined,
      menuBackground: undefined,
      terminalBackground: undefined,
      terminalForeground: undefined,
      buttonBackground: undefined,
      buttonForeground: undefined
    }
  };

  if (path.extname(manifestTheme.path) === '.json') {
    const rawTheme = parse(themeData.toString());

    // format that JSON to match the TypeScript model for Theme
    theme.colors = {
      editorBackground: rawTheme.colors["editor.background"],
      editorForeground: rawTheme.colors["editor.foreground"],
      foreground: rawTheme.colors["foreground"],
      activityBarBackground: rawTheme.colors["activityBar.background"],
      activityBarForeground: rawTheme.colors["activityBar.foreground"],
      sideBarBackground: rawTheme.colors["sideBar.background"],
      sideBarForeground: rawTheme.colors["sideBar.foreground"],
      editorGroupHeaderNoTabsBackground: rawTheme.colors["editorGroupHeader.noTabsBackground"],
      editorGroupHeaderTabsBackground: rawTheme.colors["editorGroupHeader.tabsBackground"],
      statusBarBackground: rawTheme.colors["statusBar.background"],
      statusBarForeground: rawTheme.colors["statusBar.foreground"],
      titleBarActiveBackground: rawTheme.colors["titleBar.activeBackground"],
      titleBarActiveForeground: rawTheme.colors["titleBar.activeForeground"],
      menuForeground: rawTheme.colors["menu.foreground"],
      menuBackground: rawTheme.colors["menu.background"],
      terminalBackground: rawTheme.colors["terminal.background"],
      terminalForeground: rawTheme.colors["terminal.foreground"],
      buttonBackground: rawTheme.colors["button.background"],
      buttonForeground: rawTheme.colors["button.foreground"]
    };

    // Convert colors to HSL
    let key: keyof typeof theme.colors;
    for (key in theme.colors) {
      if (theme.colors[key]) {
        theme.colors[key] = new Color(theme.colors[key]).toJSON('hsl');
      }
    }

  } else { // theme data is a plist of info

    const plist = plistparse(themeData)
    let settings: ITextMateThemingRule[] = plist.settings
    if (!Array.isArray(settings)) {
      return Promise.reject(new Error("error.plist.invalidFormat"))
    }

    theme.colors = convertSettings(settings);
  }

  // save that object to CosmosDb
  return await _saveTheme(theme);
}

const _saveTheme = async (theme: any) => {
  const response = await axios.post(`${process.env.FUNCTIONS_URL}ThemeUpsert`, { theme });
  return response.data;
}

export default saveTheme;