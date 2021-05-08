import * as vscode from 'vscode';
import { SettingKeys } from './enums/index';

export class InstallPrompt {

  constructor(private state: vscode.Memento, private theme: any, private extension: any) { }

  private installMessage = `Do it!` ;

  public async activate(): Promise<void> {
    const show = this.shouldShowBanner();
    if (!show) {
      return;
    }

    await this.showInstallPrompt();
  }

  /**
   * Returns whether the user has requested to not
   * see this prompt again
   */
  private shouldShowBanner(): boolean {
    if (this.state.get(SettingKeys.installPrompt)) {
      return false;
    }
    return true;
  }

  private async showInstallPrompt(): Promise<void> {
    const prompts = [this.installMessage, 'No thanks'];

    const selection = await vscode.window.showInformationMessage(
      "Is this the theme you've been waiting for? Want to install it?",
      ...prompts,
    );

    if (!selection) {
      return;
    }

    if (selection === this.installMessage) {
      let themeExtension = vscode.extensions.getExtension(this.theme.extensionName);
      if(themeExtension == undefined){
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification },
          (progress) => {
            progress.report({ message: `Installing ${this.theme.name} theme...` });
  
            return new Promise((resolve) => {
              vscode.extensions.onDidChange((e) => resolve(null));
              vscode.commands.executeCommand("workbench.extensions.installExtension", this.theme.extensionName);
            });
          },
        );
        themeExtension = vscode.extensions.getExtension(this.theme.extensionName);  
      }


      if (themeExtension !== undefined) {
        const conf = vscode.workspace.getConfiguration();
        await themeExtension.activate().then(async f => {
          await conf.update(
            'workbench.colorTheme',
            this.theme.name,
            vscode.ConfigurationTarget.Global
          );
          vscode.window.showInformationMessage(
            `Theme changed to ${this.theme.name}`
          );
        });
      }
      
    }
  }
}