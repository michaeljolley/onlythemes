import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Rating } from "../Models/rating";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  let rating: Rating = req.body;

  if (rating) {

    try {
      const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
      const { container } = await database.containers.createIfNotExists({ id: "ratings" });

      // Lookup the rating in CosmosDb
      const { resources } = await container.items
        .query({
          query: "SELECT * from c WHERE c.userId = @userId AND c.themeId = @themeId",
          parameters: [
            {
              name: "@userId",
              value: rating.userId
            },
            {
              name: '@themeId',
              value: rating.themeId
            }]
        })
        .fetchAll();

      const existingRating = resources[0];

      if (existingRating) {
        rating.id = existingRating.id;
      }

      const { resource } = await container.items.upsert(rating);
      rating.id = resource.id;

      context.res = {
        status: 200,
        body: rating
      };
    }
    catch (err) {
      context.res = {
        status: 500,
        body: err
      };
    }
  } else {
    context.res = {
      status: 404
    };
  }
};

export default httpTrigger;
