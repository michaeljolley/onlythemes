import { extensions } from 'vscode';

/**
 * Returns the package.json contents for the Vonage extension.
 */
export function getExtensionInfo(): any {
  const extension = extensions.getExtension('michaeljolley.onlythemes');
  if (extension) {
    return extension.packageJSON;
  }

  return {};
}