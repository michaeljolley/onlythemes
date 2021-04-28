import * as vscode from 'vscode';

export class ThumbnailViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "thumbnailView";
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

    // webviewView.webview.onDidReceiveMessage(async (data) => {

    //     await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification },
    //     async (progress) => {

    //       switch (data.type) {
    //         case "swipeLeft": {
    //           await this.setRanking(Rating.SwipeLeft);
    //           break;
    //         }
    //         case "swipeRight": {
    //           await this.setRanking(Rating.SwipeRight);
    //           await this.installPrompt();
    //           break;
    //         }
    //         case "nextTheme": {
    //           break;
    //         }
    //       }
    //       await this.getThemeSuggestion();
    //     },
    //   );
    // });

  }

  private _getHtmlForWebview(theme: any, extension: any) {
    
    // Do the same for the stylesheet.
    const styleResetUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "thumbnail.css")
    );
    
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
        
				<title>${theme.name}</title>
			</head>
			<body>
        <article>
          <header>
            <h1>${theme.name}</h1>
            <h2>by ${extension.publisher.displayName}</h2>
          </header>
          <main>
            
          </main>
        </article>
			</body>
			</html>`;
  }
}
