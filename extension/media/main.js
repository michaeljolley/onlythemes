/* eslint-disable no-undef */
// @ts-nocheck

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  document.querySelector('.swipe-left-button').addEventListener('click', () => {
    swipeLeft();
  });

  document.querySelector('.swipe-right-button').addEventListener('click', () => {
    swipeRight();
  });

  document.querySelector('#preview').addEventListener('click', (event) => {
    previewTheme(event);
  });

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case 'loadTheme':
        {
          //loadTheme(message.data);
          break;
        }
    }
  });

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

