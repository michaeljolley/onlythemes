/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITextMateThemingRule, IColorMap } from './workbenchThemeService';
import { Color } from './color';

const settingToColorIdMapping: { [settingId: string]: string[] } = {};
function addSettingMapping(settingId: string, colorId: string) {
	let colorIds = settingToColorIdMapping[settingId];
	if (!colorIds) {
		settingToColorIdMapping[settingId] = colorIds = [];
	}
	colorIds.push(colorId);
}

export function convertSettings(oldSettings: ITextMateThemingRule[], result: { textMateRules: ITextMateThemingRule[], colors: IColorMap }): void {
	for (let rule of oldSettings) {
		result.textMateRules.push(rule);
		if (!rule.scope) {
			let settings = rule.settings;
			if (!settings) {
				rule.settings = {};
			} else {
				for (const settingKey in settings) {
					const key = <keyof typeof settings>settingKey;
					let mappings = settingToColorIdMapping[key];
					if (mappings) {
						let colorHex = settings[key];
						if (typeof colorHex === 'string') {
							let color = Color.fromHex(colorHex);
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
