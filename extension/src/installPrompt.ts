import * as vscode from 'vscode';
import { SettingKeys } from './enums/index';

export class InstallPrompt {

  constructor(private state: vscode.Memento, private theme: any, private extension: any) {

  }

  public activate(): void {
    const show = this.shouldShowBanner();
    if (!show) {
      return;
    }

    this.showInstallPrompt();
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
    const prompts = [`Do it!`];

    const selection = await vscode.window.showInformationMessage(
      "Is this the theme you've been waiting for? Want to install it?",
      ...prompts,
    );

    if (!selection) {
      return;
    }

    // Install the extension and set theme

  }
}