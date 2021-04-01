import * as vscode from 'vscode';
import fetch from 'node-fetch';

export class OnlyThemesViewProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'onlyThemesView';
  private _view?: vscode.WebviewView;

  constructor(
    private _state: vscode.Memento,
    private readonly _extensionUri: vscode.Uri) {  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'swipeLeft':
          {
            // Send left swipe to Azure
            vscode.window.showInformationMessage('leftSwipe');
            break;
          }
        case 'swipeRight':
          {
            // Send right swipe to Azure
            vscode.window.showInformationMessage('rightSwipe');
            break;
          }
        case 'nextTheme':
          {
            break;
          }
      }
      await this.getThemeSuggestion();
    });

    await this.getThemeSuggestion();
  }

  

  public async getThemeSuggestion(): Promise<void> {
    if (this._view) {
      try {
        const response = await fetch(`https://onlythemes.azurewebsites.net/api/ThemeSuggest?userId=abasba`);
        const theme = await response.json();

        this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders

        this._view.webview.html = this._getHtmlForWebview(theme);
      }
      catch(err) {
        console.error(err);
      }
    }
  }

  private _getHtmlForWebview(theme: any) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

    // Do the same for the stylesheet.
    const styleResetUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
    const styleMainUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

// 	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this._view?.webview.cspSource}; script-src 'nonce-${nonce}';">

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Only Themes</title>
			</head>
			<body>
        <article>
          <header>
            <h1>${theme.name}</h1>
          </header>
          <main>
            <img src="https://onlythemes.azurewebsites.net/api/ThemeImage?themeId=${theme.id}">
            <h2>Author: Yo mama</h2>

            <a href="https://onlythemes.azurewebsites.net/api/ThemeImage?themeId=${theme.id}">https://onlythemes.azurewebsites.net/api/ThemeImage?themeId=${theme.id}</a>

          </main>
          <footer>
            <button class="swipe-left-button">Swipe Left</button>
				    <button class="swipe-right-button">Swipe Right</button>
          </footer>
        </article>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}