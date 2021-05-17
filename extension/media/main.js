/* eslint-disable no-undef */
// @ts-nocheck

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  document.querySelector('.swipe-left-button').addEventListener('click', () => {
    swipeLeft();
    displayLoadingStyle();
  });

  document.querySelector('.swipe-right-button').addEventListener('click', () => {
    swipeRight();
    displayLoadingStyle();
  });

  document.querySelector('#preview').addEventListener('click', (event) => {
    previewTheme(event);
  });

  function displayLoadingStyle() {
    document.querySelector('.swipe-left-button').setAttribute('disabled', true);
    document.querySelector('.swipe-right-button').setAttribute('disabled', true);
    document.querySelector('.repo').classList.add('loader');
  }

  function swipeLeft() {
    vscode.postMessage({ type: 'swipeLeft' });
  }

  function swipeRight() {
    vscode.postMessage({ type: 'swipeRight' });
  }

  function previewTheme(e) {
    e.preventDefault();
    vscode.postMessage({ type: 'preview' });
  }

}());
