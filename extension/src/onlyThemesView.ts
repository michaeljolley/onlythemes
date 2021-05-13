import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { Settings } from './settings';
import { Rating } from './enums';
import { InstallPrompt } from './installPrompt';

type HSLColor = {
  h: number;
  s: number;
  l: number;
};

type LIGHT = "Light";
type DARK = "Dark";

const colorPrefixes = ['editor', 'sideBar', 'activityBar', 'titleBarActive'];

export class OnlyThemesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "onlyThemesView";
  private _view?: vscode.WebviewView;
  private theme: any | undefined;
  private extension: any | undefined;

  constructor(
    private _state: vscode.Memento,
    private readonly _extensionUri: vscode.Uri
  ) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.onDidReceiveMessage(async (data) => {

        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification },
        async (progress) => {

          switch (data.type) {
            case "swipeLeft": {
              await this.setRanking(Rating.SwipeLeft);
              await this.getThemeSuggestion();
              break;
            }
            case "swipeRight": {
              await this.setRanking(Rating.SwipeRight);
              await this.installPrompt();
              await this.getThemeSuggestion();
              break;
            }
            case "preview": {
              await vscode.commands.executeCommand('onlyThemes.loadPreview', this.theme, this.extension);
              break;
            }
            case "nextTheme": {
              break;
            }
          }
        },
      );
    });

    await this.getThemeSuggestion();
  }

  public async getThemeSuggestion(): Promise<void> {
    if (this._view) {
      try {
        const userId = await Settings.getUser();
        this.theme = undefined;

        if (userId) {
          const response = await fetch(
            `https://onlythemes.azurewebsites.net/api/ThemeSuggest?userId=${userId}`
          );
          const { theme, extension } = await response.json();

          if (theme && extension) {
            this.theme = theme;
            this.extension = extension;

            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.html = this._getHtmlForWebview(theme, extension);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public async setRanking(rating: number): Promise<void> {
    if (this._view) {
      try {
        const userId = await Settings.getUser();

        if (userId && this.theme) {
          const response = await fetch(`https://onlythemes.azurewebsites.net/api/RatingUpsert`, {
            method: 'POST',
            body: JSON.stringify({
              userId,
              themeId: this.theme.id,
              rating
            })
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  private async installPrompt(): Promise<void> {
    const installPrompt = new InstallPrompt(this._state, this.theme, this.extension);
    await installPrompt.activate();
  }

  private _getHSLCSSDeclaration(hslColorObject: HSLColor) {
    return `hsl(${hslColorObject.h}, ${hslColorObject.s}%, ${hslColorObject.l}%)`;
  }

  private _getColorPair(group: string): string {
    if (this.theme && this.theme.colors) {
      if (this.theme.colors[`${group}Background`] &&
      this.theme.colors[`${group}Foreground`]) {
        return `<dl>
          <dt style="background-color:${this._getHSLCSSDeclaration(this.theme.colors[`${group}Background`])}"></dt>
          <dd style="background-color:${this._getHSLCSSDeclaration(this.theme.colors[`${group}Foreground`])}"></dd>
        </dl>`;
      }
    }
    return '';
  }

  private _getHtmlForWebview(theme: any, extension: any) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    // Do the same for the stylesheet.
    const styleResetUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    );

    // Do the same for the thumb icons
    const thumbsUpUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "thumbs-up.svg")
    );
    const thumbsDownUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "thumbs-down.svg")
    );
    const arrowExpandUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "arrows-angle-expand.svg")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    const colorPalette = colorPrefixes.map(p => this._getColorPair(p)).join('\n');
    
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
            <h2>by ${extension.publisher.displayName}</h2>
          </header>
          <main>
            <a title="Click to expand"
              id="preview"
              href="#">
              <div id="thmImgHolder" class="loadingImage">
                <img id="thmImg"  src="https://onlythemes.azurewebsites.net/api/ThemeImage?themeId=${
                  theme.id}">
              </div>
            </a>
            <section>
              <div class="mode ${theme.type}"></div>
              <a class="link" 
                title="View extension on the marketplace"
                href="https://marketplace.visualstudio.com/items?itemName=${theme.extensionName}"></a>
            </section>
          </main>
        </article>
        <footer>
          <button class="swipe-left-button" title="Not interested">
            <img src="${thumbsDownUri}"/>
          </button>
          <a class="repo" href="https://bbb.dev/onlythemes" title="See the code"></a>
          <button class="swipe-right-button" title="I like it!">
              <img src="${thumbsUpUri}"/>
          </button>
        </footer>
				<script nonce="${nonce}" src="${scriptUri}"></script>
        <script>
          document.querySelector('#thmImg').addEventListener('load', () => {
            document.querySelector('.loadingImage').classList.toggle("loadingImage");
            document.querySelector('.swipe-left-button').style.cursor = "pointer";
            document.querySelector('.swipe-right-button').style.cursor = "pointer";
          })
        </script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
