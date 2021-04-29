import * as vscode from 'vscode';
import { Extension } from './models/extension';
import { Theme } from './models/theme';

export class PreviewPanel {
  public static readonly viewType = "previewPanel";

	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

  constructor(
    private _state: vscode.Memento,
    private readonly _extensionUri: vscode.Uri,
		private _theme: Theme,
		private _extension: Extension
  ) {

		this._panel = vscode.window.createWebviewPanel(
			PreviewPanel.viewType,
			_theme.name,
			vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [vscode.Uri.joinPath(_extensionUri, 'media')]
			},
		);

		// Set the webview's initial html content
    this._panel.title = _theme.name;
		this._panel.webview.html = this._getHtmlForWebview();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

	// public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
	// 	PreviewPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	// }

	public dispose() {

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

  private _getHtmlForWebview() {
    
    // Do the same for the stylesheet.
    const styleResetUri =  this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri =  this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "preview.css")
    );

		const installsIcon = this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "download.svg")
		);
		const versionIcon = this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "version.svg")
		);
		const githubIcon = this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "github.svg")
		);
		const twitterIcon = this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "twitter.svg")
		);
		const linkIcon = this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "link.svg")
		);

		const iconUri = this._extension.versions[0].files
									.find(f => f.assetType === 'Microsoft.VisualStudio.Services.Icons.Small')?.source || '';
		const installCount = this._extension.statistics
									.find(f => f.statisticName === 'install')?.value || 0;
		const githubLink = this._extension.versions[0].properties.find(f => f.key === 'Microsoft.VisualStudio.Services.Links.GitHub')?.value;

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
        
				<title>${this._theme.name}</title>
			</head>
			<body>
        <article>
          <header>
						<img src="${iconUri}"/>
						<div>
							<h1>${this._theme.name}</h1>
							<h2>by ${this._extension.publisher.displayName}</h2>
							<p>${this._extension.shortDescription}</p>
						</div>
          </header>
          <main>
            <img src="https://onlythemes.azurewebsites.net/api/ThemeImage?themeId=${this._theme.id}"/>
          </main>
					<footer>
						<div>
							<dl title="Type">
								<dt class="icon ${this._theme.type}"></dt>
								<dd>${this._theme.type === 'vs' ? 'Light': 'Dark'}</dd>
							</dl>
							<dl title="Version">
								<dt class="icon">
									<img src="${versionIcon}"/>
								</dt>
								<dd>v${this._extension.versions[0].version}</dd>
							</dl>
							<dl title="Installs">
								<dt class="icon">
									<img src="${installsIcon}"/>
								</dt>
								<dd>${installCount.toLocaleString('en')}</dd>
							</dl>
						</div>
						<div>
							<ul>
								<li>
									<a 
										title="View on VS Code Marketplace"
										href="https://marketplace.visualstudio.com/items?itemName=${this._theme.extensionName}">
										<img src="${linkIcon}"/>
									</a>
								</li>
								<li>
									<a 
										title="View it on GitHub"
										href="${githubLink}">
										<img src="${githubIcon}"/>
									</a>
								</li>
							</ul>
						</div>
					</footer>
        </article>
			</body>
			</html>`;
  }
}
