import { isDate } from 'node:util';
import * as vscode from 'vscode';

let activeExtension: Extension;

class Extension {
	private readonly context: vscode.ExtensionContext;
	private readonly availableThemes: {extensionId: string; label: string; id: string }[] = [];

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	public async initialize() {
		const statusBarItem = Extension.createStatusBarItem(this.context);
		statusBarItem.show();
		activeExtension = this;

		const outputWindow = vscode.window.createOutputChannel("OnlyThemes");

		outputWindow.appendLine(`Installed Extensions: ${vscode.extensions.all.length}`);
		outputWindow.appendLine(`Installed Theme Extensions ${vscode.extensions.all.filter(ext => 
			ext.packageJSON.contributes && 
			ext.packageJSON.contributes.themes && 
			ext.packageJSON.contributes.themes.length > 0
			).length}`);

		const extensionId = vscode.workspace.getConfiguration("onlythemes-backend-helper").get<string|undefined>("extensionId", undefined);
		if (extensionId) {
			outputWindow.appendLine("Activating first theme in the recenty installed extension");
			const themeExtension =  vscode.extensions.getExtension(extensionId);
			if (themeExtension) {
				await themeExtension.activate();
				themeExtension.packageJSON.contributes.themes.map((theme: {label: string; id: string; uiTheme: string}) => {
					const iTheme = { extensionId: themeExtension.id, label: theme.label, id: theme.id, isDark: theme.uiTheme !== 'vs' };
					outputWindow.appendLine(`[${iTheme.id}]: ${iTheme.label}`);
					this.availableThemes.push(iTheme);
				});
				vscode.commands.executeCommand('onlythemes-backend-helper.nextTheme');
			}
			await vscode.workspace.getConfiguration("onlythemes-backend-helper").update("extensionId", undefined, true);
		}

		const installThemeCommand = vscode.commands.registerCommand('onlythemes-backend-helper.installTheme', () => {
			vscode.window.showInputBox({
				prompt: "Enter the extension id",				
			}).then(async (themeId) => {
				if (themeId) {
					await vscode.commands.executeCommand("workbench.extensions.installExtension", themeId);
					await vscode.workspace.getConfiguration("onlythemes-backend-helper").update("extensionId", themeId, true);
					vscode.commands.executeCommand("workbench.action.reloadWindow", false);
				}
			});
		});

		const nextThemeCommand = vscode.commands.registerCommand('onlythemes-backend-helper.nextTheme', async () => {
			outputWindow.appendLine("Changing to the next theme...");
			if (this.availableThemes.length > 0) {
				const iTheme = this.availableThemes.shift();
				if (iTheme) {
					outputWindow.appendLine(JSON.stringify(iTheme));
					outputWindow.appendLine(`Changing theme to [${iTheme.id}] ${iTheme.label}`);
					const themeExtension = vscode.extensions.getExtension(iTheme.extensionId);
					if (themeExtension) {
						const conf = vscode.workspace.getConfiguration();
						await themeExtension.activate().then(async f => {
							await conf.update('workbench.colorTheme', iTheme.id || iTheme.label, vscode.ConfigurationTarget.Global);
							outputWindow.appendLine(`Theme changed to ${iTheme.label}`);
						});
					}
				}
				outputWindow.appendLine(`Themes remaining: ${this.availableThemes.length}`);
			}
		});

		this.context.subscriptions.push(installThemeCommand, outputWindow);
	}

	public deactivate() {}

	private static createStatusBarItem(context: vscode.ExtensionContext): vscode.StatusBarItem {
		const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
		statusBarItem.tooltip = "OnlyThemes Backend Helper";
		statusBarItem.text = "$(extensions) OnlyThemes";
		context.subscriptions.push(statusBarItem);
		return statusBarItem;
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	const extension: Extension = new Extension(context);
	await extension.initialize();

	console.log('Congratulations, your extension "onlythemes-backend-helper" is now active!');
	let disposable = vscode.commands.registerCommand('onlythemes-backend-helper.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from OnlyThemes Backend Helper!');
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (activeExtension) {
		activeExtension.deactivate();
	}
}
