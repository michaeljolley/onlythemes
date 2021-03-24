const fs = require('fs').promises;
const path = require('path');
const { parse } = require('comment-json');
const axios = require('axios');

module.exports = async (extensionDir, manifestTheme) => {

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
  return await saveTheme(theme);
}

const saveTheme = async (theme) => {
  const response = await axios.post(`${process.env.FUNCTIONS_URL}ThemeUpsert`, { theme });
  return response.data;
}
