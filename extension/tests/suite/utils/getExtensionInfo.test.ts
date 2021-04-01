import * as vscode from 'vscode';
import * as assert from 'assert';
import * as utils from '../../../src/utils';

suite('Utils:getExtensionInfo', () => {
  test('Returns vonage.vscode extension', async () => {
    const extensionInfo = utils.getExtensionInfo();

    assert.notDeepStrictEqual(extensionInfo, {});
    assert.strictEqual(<vscode.Extension<any>>extensionInfo.id, 'vonage.vscode');
  });
});