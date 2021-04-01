/**
 * Keys for objects stored in memento
 */
export enum StorageKeys {
  /**
   * Flag denoting to not display the survey prompt again
   */
  doNotShowSurveyPromptAgain = 'vonageDoNotShowSurveyPromptAgain',
  /**
   * Flag denoting to not display the telemetry prompt again
   */
  doNotShowTelemetryPromptAgain = 'vonageDoNotShowTelemetryPromptAgain',
  /**
   * Last date the survey prompt was displayed
   */
  lastSurveyDate = 'vonageLastSurveyDate',
  /**
   * Whether to hide the account balance by default
   */
  hideAccountBalance = 'hideAccountBalance',
  /**
   * Last country selected
   */
  lastCountrySelected = 'lastCountrySelected',
  /**
   * Display numbers that are assigned to applications
   */
  displayAssignedOnly = 'displayAssignedOnly'
}