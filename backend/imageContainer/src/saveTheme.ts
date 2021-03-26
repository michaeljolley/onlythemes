import{ promises as fs } from 'fs'
import * as path from 'path'
import { parse } from 'comment-json'
import axios from 'axios'

export const saveTheme = async (extensionDir: string, manifestTheme: any) => {

  const colorPath = path.join(`/home/coder/.vscode/extensions/${extensionDir}/`, manifestTheme.path);

  const themeData = await fs.readFile(colorPath);

  const rawTheme = parse(themeData.toString());

  // format that JSON to match the TypeScript model for Theme
  const theme = {
    name: rawTheme.name,
    colors: rawTheme.colors,
    tokenColors: rawTheme.tokenColors,
    semanticHighlighting: rawTheme.semanticHighlighting,
    extensionId: process.env.EXTENSION
  };

  // save that object to CosmosDb
  return await _saveTheme(theme);
}

const _saveTheme = async (theme: any) => {
  const response = await axios.post(`${process.env.FUNCTIONS_URL}ThemeUpsert`, { theme });
  return response.data;
}

export default saveTheme;