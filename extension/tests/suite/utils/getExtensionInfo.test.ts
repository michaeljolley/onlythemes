import * as vscode from 'vscode';
import * as assert from 'assert';
import * as utils from '../../../src/utils';

suite('Utils:getExtensionInfo', () => {
  test('Returns michaeljolley.onlythemes extension', async () => {
    const extensionInfo = utils.getExtensionInfo();

    assert.notDeepStrictEqual(extensionInfo, {});
    assert.strictEqual(<vscode.Extension<any>>extensionInfo.id, 'michaeljolley.onlythemes');
  });
});