import * as vscode from 'vscode';
import ua from 'universal-analytics';
import osName from 'os-name';
import publicIp from 'public-ip';
import { getExtensionInfo } from './utils';

export interface Telemetry {
  sendEvent(eventCategory: string, eventName: string, eventValue?: any): void;
  isTelemetryEnabled(): boolean;
}

/**
 * A NoOp implementation of telemetry
 */
export class NoOpTelemetry implements Telemetry {
  /**
   * NoOp implementation of sending a telemetry event
   * @param eventCategory Area of the extension the event lives
   * @param eventName Name of the event that occurred
   * @param eventValue Optional value of the event
   */
  sendEvent(eventCategory: string, eventName: string, eventValue?: any) {
    return;
  }

  /**
   * NoOp implementation of identifying if telemetry is enabled
   */
  isTelemetryEnabled(): boolean {
    return true;
  }
}

/**
 * A local implementation of telemetry to use during 
 * debug sessions
 */
export class LocalTelemetry implements Telemetry {

  /**
   * Records telemetry to the debug console
   * @param eventCategory Area of the extension the event lives
   * @param eventName Name of the event that occurred
   * @param eventValue Optional value of the event
   */
  sendEvent(eventCategory: string, eventName: string, eventValue?: any) {
    console.log(`[TelemetryEvent] ${eventCategory}: ${eventName}: ${eventValue}`);
  }

  /**
   * NoOp implementation of identifying if telemetry is enabled
   */
  isTelemetryEnabled() {
    return true;
  }
}

/**
 * Google Auth Implementation of Telemetry
 */
export class GoogleAnalyticsTelemetry implements Telemetry {
  private static INSTANCE: GoogleAnalyticsTelemetry;

  visitor: any;
  userId: string;
  ip: string;
  private _isTelemetryEnabled: boolean;

  private constructor() {
    this.userId = vscode.env.machineId;
    this.ip = '';
    this._isTelemetryEnabled = this.areAllTelemetryConfigsEnabled();
    this.setup();
    vscode.workspace.onDidChangeConfiguration(this.configurationChanged, this);
  }

  /**
   * Retrieves the current instance of the telemetry object
   */
  public static getInstance(): Telemetry {
    if (!GoogleAnalyticsTelemetry.INSTANCE) {
      GoogleAnalyticsTelemetry.INSTANCE = new GoogleAnalyticsTelemetry();
    }

    return GoogleAnalyticsTelemetry.INSTANCE;
  }

  /**
   * Returns whether both global & OnlyThemes specific
   * telemetry settings are enabled
   */
  isTelemetryEnabled(): boolean {
    return this.areAllTelemetryConfigsEnabled();
  }

  /**
   * 
   */
  async setup(): Promise<void> {

    /**
     * If the user has opted out of sending telemetry
     * there's no need to continue.
     */
    if (!this.isTelemetryEnabled) {
      return;
    }

    if (this.visitor) {
      return;
    }

    this.visitor = ua('');

    const extensionInfo = getExtensionInfo();

    /**
     * Store
     */
    this.ip = await publicIp.v4();

    /**
     * User custom dimensions to store user metadata
     */
    this.visitor.set('applicationVersion ', vscode.version);
    this.visitor.set('userLanguage', vscode.env.language);
    this.visitor.set('cd1', osName());
    this.visitor.set('cd2', extensionInfo.version);

    /**
     * Set userID
     */
    this.visitor.set('uid', this.userId);
  }

  /**
   * Records event to telemetry 
   * @param eventCategory Area of the extension the event lives
   * @param eventName Name of the event that occurred 
   * @param eventValue Optional value of the event
   */
  sendEvent(eventCategory: string, eventName: string, eventValue?: any): void {
    if (!this.isTelemetryEnabled) {
      return;
    }

    const requestParams = {
      eventCategory: 'All',
      eventAction: eventName,
      eventValue: eventValue,
      uip: this.ip,
      uid: this.userId,
    };

    this.visitor.event(requestParams).send();
  }

  /**
   * Handles setting up telemetry if the user enabled it
   * @param configurationChangeEvent Event fired when a configuration option has changed in VS Code
   */
  private configurationChanged(configurationChangeEvent: vscode.ConfigurationChangeEvent): void {
    this._isTelemetryEnabled = this.areAllTelemetryConfigsEnabled();
    if (this._isTelemetryEnabled) {
      this.setup();
    }
  }

  /**
   * Respect both the overall and OnlyThemes-specific telemetry configs
   */
  private areAllTelemetryConfigsEnabled(): boolean {
    const enableTelemetry = vscode.workspace
      .getConfiguration('telemetry')
      .get('enableTelemetry', false);
    const onlyThemesEnableTelemetry = vscode.workspace
      .getConfiguration('onlyThemes.telemetry')
      .get('enabled', false);
    return enableTelemetry && onlyThemesEnableTelemetry;
  }
}