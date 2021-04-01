import * as vscode from 'vscode';
import { GoogleAnalyticsTelemetry, LocalTelemetry } from './telemetry';
import {
  TelemetryPrompt
} from './prompts';
import { OnlyThemesViewProvider } from './onlyThemesView';

let activeExtension: Extension;
let _context: vscode.ExtensionContext;

export class Extension {

  /**
   * Activate the extension
   */
  activate = async () => {

    /**
     * Notify user of telemetry collection on first use.
     */
    new TelemetryPrompt(_context.globalState).activate();

    /**
     * Activate telemetry.
     * Will only collect information if both global telemetry
     * and OnlyThemes specific telemetry settings are allowed.
     */
    const telemetry = getTelemetry();
    telemetry.sendEvent('Activation', 'activate');

    /**
     * Register commands & views
     */
    const onlyThemesViewProvider = new OnlyThemesViewProvider(_context.globalState, _context.extensionUri);

    _context.subscriptions.push(
      vscode.commands.registerCommand('onlyThemes.getThemeSuggestion', () => {
        onlyThemesViewProvider.getThemeSuggestion();
      }));

    _context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(OnlyThemesViewProvider.viewType, onlyThemesViewProvider));
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

/**
 * Checks for the explicit setting of the EXTENSION_MODE and
 * implicitly checks by using the magic session string. This session value is used whenever an extension
 * is running on a development host. https://github.com/microsoft/vscode/issues/10272
 */
function getTelemetry() {
  if (process.env.EXTENSION_MODE === 'development' || vscode.env.sessionId === 'someValue.sessionId') {
    return new LocalTelemetry();
  } else {
    return GoogleAnalyticsTelemetry.getInstance();
  }
}