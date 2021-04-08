import { ThemeColors } from './themeColors';

export class Theme {
  constructor(
    public name: string,
    public extensionId: string,
    public imageCaptured: boolean = false,
    public colors: ThemeColors,
    public id?: string
  ) { }
}