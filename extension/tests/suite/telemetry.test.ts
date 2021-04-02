import * as assert from 'assert';
import * as vscode from 'vscode';
import { GoogleAnalyticsTelemetry } from '../../src/telemetry';

suite('Telemetry', function () {
  this.timeout(20000);
  const telemetry = GoogleAnalyticsTelemetry.getInstance();

  test('Respects overall and OnlyThemes-specific telemetry configs', async () => {
    const workspaceFolder =
      vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
    const telemetryConfig = vscode.workspace.getConfiguration('telemetry', workspaceFolder);
    const onlyThemesTelemetryConfig = vscode.workspace.getConfiguration(
      'onlythemes.telemetry',
      workspaceFolder,
    );

    await telemetryConfig.update('enableTelemetry', false);
    await onlyThemesTelemetryConfig.update('enabled', false);
    assert.strictEqual(telemetry.isTelemetryEnabled(), false);

    await telemetryConfig.update('enableTelemetry', false);
    await onlyThemesTelemetryConfig.update('enabled', true);
    assert.strictEqual(telemetry.isTelemetryEnabled(), false);

    await telemetryConfig.update('enableTelemetry', true);
    await onlyThemesTelemetryConfig.update('enabled', false);
    assert.strictEqual(telemetry.isTelemetryEnabled(), false);

    await telemetryConfig.update('enableTelemetry', true);
    await onlyThemesTelemetryConfig.update('enabled', true);
    assert.strictEqual(telemetry.isTelemetryEnabled(), true);
  });
});