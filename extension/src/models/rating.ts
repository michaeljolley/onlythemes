export class Rating {
  constructor(
    public userId: string,
    public themeId: string,
    public rating: number,
    public id?: string
  ) { }
}