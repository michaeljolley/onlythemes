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
          <a class="repo" href="https://bbb.dev/onlythemes" title="See the code">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" id="git_logo">
              <defs>
                <style>
                  #git_logo {
                    fill: #ffffff;
                  }
                  #git_logo:hover{
                    fill:url(#paint1);
                  }
                </style>
                <linearGradient id="paint1" gradientTransform="rotate(90)">
                        <stop offset="0" stop-color="#fff">
                    <animate attributeName="offset" dur="2s" values="0;1;0" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="0.21" stop-color="#EA41F7">
                    <animate attributeName="offset" dur="2s" values="0.21;1;0.21" repeatCount="indefinite" />
                  </stop>
                  <stop offset="0.39" stop-color="#812FED">
                    <animate attributeName="offset" dur="2s" values="0.39;1;0.39" repeatCount="indefinite" />
                  </stop>
                  <stop offset="0.69" stop-color="#4E4FFF">
                    <animate attributeName="offset" dur="2s" values="0.69;1;0.69" repeatCount="indefinite" />
                  </stop>
                  <stop offset="0.85" stop-color="#5786FD">
                    <animate attributeName="offset" dur="2s" values="0.85;1;0.85" repeatCount="indefinite" />
                  </stop>
                  <stop offset="1" stop-color="#65D5FA">
                    <animate attributeName="offset" dur="2s" values="1;1;1" repeatCount="indefinite" />
                  </stop>
                </linearGradient> 
              </defs>
              <g>
                <path 
                  d="M426.26 384.69v35.8c0 8.22-2.44 30.86-7.31 33.94s-12.71 4.62-23.49 
                  4.62h-2.61V420.3q0-19.89-8.62-27.52t-25-7.62h-32.68q-9.06 
                  0-13.81-2.87t-4.74-9.73v-3.93h-21.23v3.93q0 6.85-4.75 9.73t-14 
                  2.87H235.5q-16.35 0-25 7.62t-8.61 27.52v38.75h-3.57q-16.54 
                  0-23.68-4.62c-4.74-3.08-7.12-25.72-7.12-33.94v-35.8h-37v40c0 
                  23.1 5 56.07 15 64.93s24.52 13.28 43.51 13.28h57q15.79 0 24.06 5t8.28 
                  16.94v20.79h37v-20.74q0-11.94 8.28-16.94t24.45-5h56.6q28.49 0 
                  43.51-13.28c10-8.86 15-41.83 15-64.93v-40zm-112 83.41q-13.1 9-16.94 
                  29.84-4.62-20.79-17.72-29.84t-37.72-9.05h-18.76v-36.32q0-7.08 
                  4.2-9.72t13.48-2.66h25q14.14 0 21.66-5.19t9.7-17.16q2.64 11.94 
                  10.16 17.13t21.68 5.22h25q9.51 0 13.6 2.66t4.08 9.72v36.32H352q-24.69 
                  0-37.77 9.05zM129.62 355.43h.13q-.51-12.4-.51-25.19c0-4.72 0-9.3.08-13.78a23.87 
                  23.87 0 01-23.61-23.86c0-13.19 11.69-23.79 24.87-23.88h.71a321.42 321.42 0 
                  014.76-36.53h-.25c16.5-80.65 83.77-141.06 161.57-141.06S441.7 151.54 458 
                  232.2h-.08a323.7 323.7 0 014.76 36.53h.7c13.19.09 24.88 10.69 24.88 23.88a23.87 
                  23.87 0 01-23.61 23.86c.05 4.48.08 9.06.08 13.78q0 12.78-.51 25.19h.13c34.39 0 
                  62.28-26.88 62.28-61.27a62 62 0 00-11.69-36.3 62.76 62.76 0 
                  00-15.26-15c-15.37-107.43-101.47-189.7-202.42-189.7S110.44 135.22 94.91 
                  242.45a62.39 62.39 0 00-27.57 51.71c0 34.39 27.88 61.27 62.28 61.27z" />
                <circle cx="222.08" cy="298.69" r="32.02" />
                <circle cx="373.08" cy="298.69" r="32.02" />
              </g>
            </svg>
          </a>
          <button class="swipe-right-button" title="I like it!">
              <img src="${thumbsUpUri}"/>
          </button>
        </footer>
		<script nonce="${nonce}" src="${scriptUri}"></script>
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
