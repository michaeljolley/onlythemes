/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITextMateThemingRule, IColorMap } from './workbenchThemeService';
const Color = require('color2');

export function convertSettings(oldSettings: ITextMateThemingRule[]): any {

	// Set a default for background & foreground
	const defaultBackgroundHex = oldSettings.find(f => !f.scope && f.settings.background)?.settings.background || "#fff";
	const defaultForegroundHex = oldSettings.find(f => !f.scope && f.settings.foreground)?.settings.foreground || "#000";

	const defaultBgColor = new Color(defaultBackgroundHex).toJSON('hsl');
	const defaultFgColor = new Color(defaultForegroundHex).toJSON('hsl');

	// Initialize the object we'll return with default values
	const result = {
		editorBackground: defaultBgColor,
		editorForeground: defaultFgColor,
		foreground: defaultFgColor,


		activityBarBackground: defaultBgColor,
		activityBarForeground: defaultFgColor,
		sideBarBackground: defaultBgColor,
		sideBarForeground: defaultFgColor,
		editorGroupHeaderNoTabsBackground: defaultBgColor,
		editorGroupHeaderTabsBackground: defaultBgColor,
		statusBarBackground: defaultBgColor,
		statusBarForeground: defaultFgColor,
		titleBarActiveBackground: defaultBgColor,
		titleBarActiveForeground: defaultFgColor,
		menuForeground: defaultFgColor,
		menuBackground: defaultBgColor,
		terminalBackground: defaultBgColor,
		terminalForeground: defaultFgColor,
		buttonBackground: defaultBgColor,
		buttonForeground: defaultFgColor
	};

	// Set the values if they are provided in the textmate theme
	// for (let rule of oldSettings) {
	// 	if (!rule.scope) {
	// 		let settings = rule.settings;
	// 		if (!settings) {
	// 			rule.settings = {};
	// 		} else {
	// 			for (const settingKey in settings) {
	// 				const key = <keyof typeof settings>settingKey;
	// 				let mappings = settingToColorIdMapping[key];
	// 				if (mappings) {
	// 					let colorHex = settings[key];
	// 					if (typeof colorHex === 'string') {
	// 						let color = Color.fromHex(colorHex);
	// 						for (let colorId of mappings) {
	// 							result.colors[colorId] = color;
	// 						}
	// 					}
	// 				}
	// 				if (key !== 'foreground' && key !== 'background' && key !== 'fontStyle') {
	// 					delete settings[key];
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	return result;
}
