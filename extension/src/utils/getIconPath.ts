import * as path from 'path';

export function getIconPath(iconName: string): any {
  return {
    light: path.join(__filename, '..', '..', '..', '..', 'resources','icons','light', `${iconName}.svg`),
    dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icons','dark', `${iconName}.svg`)
  };
}
