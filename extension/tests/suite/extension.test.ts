import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension', () => {
	test('Should start extension vonage.vscode', async () => {
		const started = vscode.extensions.getExtension('vonage.vscode');
		assert.notStrictEqual(started, undefined);
		if (started) {
			await started.activate();
			assert.strictEqual(started && started.isActive, true);
		}
	});
});