import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Theme } from "../Models/theme";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const theme: Theme = req.body.theme;

  context.log(`ThemeUpsert: ${theme.name}`);

  if (theme) {

    try {
      const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
      const { container } = await database.containers.createIfNotExists({ id: "themes" });

      // Lookup the theme in CosmosDb
      const { resources } = await container.items
        .query({
          query: "SELECT * from c WHERE c.extensionId = @extensionId AND c.name = @name",
          parameters: [
            {
              name: "@extensionId",
              value: theme.extensionId
            },
            {
              name: '@name',
              value: theme.name
            }]
        })
        .fetchAll();

      const existingTheme = resources[0];

      if (existingTheme) {
        theme.id = existingTheme.id;
      }

      const { resource } = await container.items.upsert(theme);
      theme.id = resource.id;

      context.res = {
        status: 200,
        body: theme
      };
    }
    catch (err) {
      context.res = {
        status: 500,
        body: err
      };
    }
  }

  context.res = {
    status: 404
  };
};

export default httpTrigger;
