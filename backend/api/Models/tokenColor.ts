export class TokenColor {
  constructor(
    public scope: string[],
    public settings: Record<string, string>,
    public name?: string
  ) { }
}