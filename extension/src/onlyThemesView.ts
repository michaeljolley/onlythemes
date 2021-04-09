import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { Settings } from './settings';
import { Rating } from './enums';



export class OnlyThemesViewProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'onlyThemesView';
  private _view?: vscode.WebviewView;
  private themeId: string | undefined;

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
            await this.setRanking(Rating.SwipeLeft);
            break;
          }
        case 'swipeRight':
          {
            await this.setRanking(Rating.SwipeRight);
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
        const userId = await Settings.getUser();
        this.themeId = undefined;

        if (userId) {
          const response = await fetch(`https://onlythemes.azurewebsites.net/api/ThemeSuggest?userId=${userId}`);
          const { theme, extension } = await response.json();

          if (theme && extension) {
            this.themeId = theme.id;

            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.html = this._getHtmlForWebview(theme, extension);
          }
        }
      }
      catch(err) {
        console.error(err);
      }
    }
  }

  public async setRanking(rating: number): Promise<void> {
    if (this._view) {
      try {
        const userId = await Settings.getUser();

        if (userId && this.themeId) {
          const response = await fetch(`https://onlythemes.azurewebsites.net/api/RatingUpsert`, {
            method: 'POST',
            body: JSON.stringify({
              userId,
              themeId: this.themeId,
              rating
            })
          });
        }
      }
      catch (err) {
        console.error(err);
      }
    }
  }

  private _getHtmlForWebview(theme: any, extension: any) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

    // Do the same for the stylesheet.
    const styleResetUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
    const styleMainUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

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
            <a href="https://onlythemes.azurewebsites.net/api/ThemeImage?themeId=${theme.id}">
              <img src="https://onlythemes.azurewebsites.net/api/ThemeImage?themeId=${theme.id}">
            </a>
            <h2>Author: ${extension.publisher.displayName}</h2>
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