const fs = require('fs');
const path = require('path');
const { parse } = require('comment-json');
const axios = require('axios');

module.exports = async (manifestTheme) => {

  const extensionId = process.env.EXTENSION;

  const colorPath = path.join(`/home/coder/.vscode/extensions/${extensionId}/`, manifestTheme.path);

  const rawTheme = parse(fs.readFileSync(colorPath).toString());

  // format that JSON to match the TypeScript model for Theme
  const theme = {
    name: rawTheme.name,
    colors: rawTheme.colors,
    tokenColors: rawTheme.tokenColors,
    semanticHighlighting: rawTheme.semanticHighlighting,
    extensionId
  };

  // save that object to CosmosDb
  return await saveTheme(theme);
}

const saveTheme = async (theme) => {
  return await axios.post(`${process.env.FUNCTIONS_URL}ThemeUpsert`, { theme })
}
