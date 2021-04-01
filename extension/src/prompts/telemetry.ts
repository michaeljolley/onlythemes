import * as vscode from 'vscode';
import { StorageKeys } from '../enums';

/**
 * Prompt to user regarding telemetry tracked by
 * the extension to improve it
 */
export class TelemetryPrompt {
  storage: vscode.Memento;

  constructor(state: vscode.Memento) {
    this.storage = state;
  }

  /**
   * Prompt user concerning telemetry
   */
  public activate(): void {
    const show = this.shouldShowBanner();
    if (!show) {
      return;
    }

    this.showTelemetryPrompt();
  }

  /**
   * Returns whether the user has requested to not
   * see this prompt again
   */
  private shouldShowBanner(): boolean {
    if (this.storage.get(StorageKeys.doNotShowTelemetryPromptAgain)) {
      return false;
    }
    return true;
  }

  /**
   * Notifies the user regarding the Vonage extensions telemetry
   * gathering practices
   */
  private async showTelemetryPrompt(): Promise<void> {
    this.storage.update(StorageKeys.doNotShowTelemetryPromptAgain, true);
    const prompts = ['Read More', 'Okay'];

    const selection = await vscode.window.showInformationMessage(
      "The Vonage VS Code Extension collects basic telemetry in order to improve this extension's experience. If you'd like to opt out we respect the global telemetry setting in VS Code, so we won't collect any data unless this setting is turned on.",
      ...prompts,
    );

    if (!selection) {
      return;
    }

    if (selection === 'Read More') {
      vscode.commands.executeCommand('vonage.openTelemetryInfo');
    }
  }
}