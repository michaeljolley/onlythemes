import * as vscode from 'vscode';
import { v4 } from 'uuid';
import { SettingKeys } from './enums';

export class Settings {

  private static storage: vscode.Memento;

  public static async init(storage: vscode.Memento): Promise<void> {

    this.storage = storage;

    const existingUserId = await this.getUser();

    if (!existingUserId) {
      const newUserId = v4();
      await this.storage.update(SettingKeys.userId, newUserId);
    }
  }

  public static async getUser(): Promise<string | null | undefined> {
    return await this.storage.get(SettingKeys.userId);
  }
}