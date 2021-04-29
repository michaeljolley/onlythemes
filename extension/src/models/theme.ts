import { ThemeColors } from './themeColors';

export class Theme {
  constructor(
    public name: string,
    public extensionId: string,
    public extensionName: string,
    public type: string = 'vs',
    public imageCaptured: boolean = false,
    public colors: ThemeColors,
    public id?: string
  ) { }
}