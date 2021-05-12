import * as vscode from 'vscode';
import { OnlyThemesViewProvider } from './onlyThemesView';
import { PreviewPanel } from './previewPanel';
import { Settings } from './settings';

let activeExtension: Extension;
let _context: vscode.ExtensionContext;

export class Extension {

  /**
   * Activate the extension
   */
  activate = async () => {

    /**
     * Initialize user object
     */
    await Settings.init(_context.globalState);

    /**
     * Register commands & views
     */
    const onlyThemesViewProvider = new OnlyThemesViewProvider(_context.globalState, _context.extensionUri);

    _context.subscriptions.push(
      vscode.commands.registerCommand('onlyThemes.loadPreview', (theme: any, extension: any) => {
        new PreviewPanel(
          _context.globalState,
          _context.extensionUri,
          theme,
          extension);
      }));

    _context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(OnlyThemesViewProvider.viewType, onlyThemesViewProvider));
    _context.subscriptions.push(
      vscode.commands.registerCommand("onlythemes.forgetMe", async () => {
        const forgetMeSelection = 'Yes';
        const prompts = [forgetMeSelection, 'No'];

        const selection = await vscode.window.showInformationMessage(
          "This will reset all of your OnlyThemes ratings, but it will not affect any of your installed extensions. Are you sure you want to do this?",
          ...prompts
        );
        if(selection == forgetMeSelection){
          Settings.resetUser();
        }
      }));
  }

  /**
   * Deactivate the extension. Due to uninstalling the
   * extension.
   */
  deactivate = () => {
    console.log('bye bye');
  }
}

/**
 * Activates the extension in VS Code and registers commands available
 * in the command palette
 * @param context - Context the extension is being run in
 */
export async function activate(this: any, context: vscode.ExtensionContext) {
  _context = context;
  activeExtension = new Extension();
  activeExtension.activate();
}

/**
 * Deactivates the extension in VS Code
 */
export async function deactivate() {
  if (activeExtension) {
    await activeExtension.deactivate();
  }
}