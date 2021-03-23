import { TokenColor } from "./tokenColor";

export class Theme {
  constructor(
    public name: string,
    public colors: Record<string, string>,
    public tokenColors: TokenColor[],
    public semanticHighlighting: boolean,
    public extensionId: string,
    public id?: string
  ) { }
}