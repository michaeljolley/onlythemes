export type MLRecommendation = {
  Results: {
    recommendations: [
      {
        User: string,
        Item: string,
        'Scored Rating': number
      }
    ]
  }
}

export class Recommendation {
  constructor(
    public userId: string,
    public themeId: string,
    public score: number
  ) {}
};