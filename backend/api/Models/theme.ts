import { TokenColor } from "./tokenColor";

export class Theme {
  constructor(
    public name: string,
    public colors: Record<string, string>,
    public tokenColors: TokenColor[],
    public extensionId: string,
    public imageCaptured: boolean = false,
    public id?: string
  ) { }
}