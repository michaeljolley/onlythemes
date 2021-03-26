"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSettings = void 0;
const color_1 = require("./color");
const settingToColorIdMapping = {};
function addSettingMapping(settingId, colorId) {
    let colorIds = settingToColorIdMapping[settingId];
    if (!colorIds) {
        settingToColorIdMapping[settingId] = colorIds = [];
    }
    colorIds.push(colorId);
}
function convertSettings(oldSettings, result) {
    for (let rule of oldSettings) {
        result.textMateRules.push(rule);
        if (!rule.scope) {
            let settings = rule.settings;
            if (!settings) {
                rule.settings = {};
            }
            else {
                for (const settingKey in settings) {
                    const key = settingKey;
                    let mappings = settingToColorIdMapping[key];
                    if (mappings) {
                        let colorHex = settings[key];
                        if (typeof colorHex === 'string') {
                            let color = color_1.Color.fromHex(colorHex);
                            for (let colorId of mappings) {
                                result.colors[colorId] = color;
                            }
                        }
                    }
                    if (key !== 'foreground' && key !== 'background' && key !== 'fontStyle') {
                        delete settings[key];
                    }
                }
            }
        }
    }
}
exports.convertSettings = convertSettings;
addSettingMapping('background', 'editor.background');
addSettingMapping('foreground', 'editor.foreground');
addSettingMapping('selection', 'editor.selectionBackground');
addSettingMapping('inactiveSelection', 'editor.inactiveSelectionBackground');
addSettingMapping('selectionHighlightColor', 'editor.selectionHighlightBackground');
addSettingMapping('findMatchHighlight', 'editor.findMatchHighlightBackground');
addSettingMapping('currentFindMatchHighlight', 'editor.findMatchBackground');
addSettingMapping('hoverHighlight', 'editor.hoverHighlightBackground');
addSettingMapping('wordHighlight', 'editor.wordHighlightBackground'); // inlined to avoid editor/contrib dependenies
addSettingMapping('wordHighlightStrong', 'editor.wordHighlightStrongBackground');
addSettingMapping('findRangeHighlight', 'editor.findRangeHighlightBackground');
addSettingMapping('findMatchHighlight', 'peekViewResult.matchHighlightBackground');
addSettingMapping('referenceHighlight', 'peekViewEditor.matchHighlightBackground');
addSettingMapping('lineHighlight', 'editor.lineHighlightBackground');
addSettingMapping('rangeHighlight', 'editor.rangeHighlightBackground');
addSettingMapping('caret', 'editorCursor.foreground');
addSettingMapping('invisibles', 'editorWhitespace.foreground');
addSettingMapping('guide', 'editorIndentGuide.background');
addSettingMapping('activeGuide', 'editorIndentGuide.activeBackground');
const ansiColorMap = ['ansiBlack', 'ansiRed', 'ansiGreen', 'ansiYellow', 'ansiBlue', 'ansiMagenta', 'ansiCyan', 'ansiWhite',
    'ansiBrightBlack', 'ansiBrightRed', 'ansiBrightGreen', 'ansiBrightYellow', 'ansiBrightBlue', 'ansiBrightMagenta', 'ansiBrightCyan', 'ansiBrightWhite'
];
for (const color of ansiColorMap) {
    addSettingMapping(color, 'terminal.' + color);
}
