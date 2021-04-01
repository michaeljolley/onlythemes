import * as vscode from 'vscode';

export class TestMemento implements vscode.Memento {
  storage: Map<string, any>;

  constructor() {
    this.storage = new Map();
  }

  public get(key: string, defaultValue?: any): any {
    const data = this.storage.has(key) ? this.storage.get(key) : undefined;
    return data ? data : defaultValue;
  }

  public update(key: string, value: any): Thenable<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  public setKeysForSync(keys: []): void {
    return;
  }
}

export const mocks = {
  extensionContextMock: {
    subscriptions: [],
    workspaceState: new TestMemento(),
    globalState: new TestMemento(),
    extensionPath: '',
    asAbsolutePath: (relativePath: string) => '',
    storagePath: '',
    globalStoragePath: '',
    logPath: '',
    extensionMode: vscode.ExtensionMode.Test
  },
};