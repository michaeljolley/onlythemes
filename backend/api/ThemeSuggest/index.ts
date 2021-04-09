import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Extension } from "../Models/extension";
import { Theme } from "../Models/theme";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  let theme: Theme | undefined;
  let extension: Extension | undefined;

  const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
  const { container } = await database.containers.createIfNotExists({ id: "themes" });
  const extensionContainer = await database.containers.createIfNotExists({ id: "extensions" });

  // Lookup the extensionId in CosmosDb
  const { resources } = await container.items
    .query({
      query: "SELECT TOP 1000 * from c WHERE c.imageCaptured=true"
    })
    .fetchAll();

  const randomIndex = Math.floor(Math.random() * (resources.length - 0 + 1)) + 0;

  theme = resources[randomIndex];

  const extensionResources = await extensionContainer.container.items
    .query({
      query: "SELECT * from c WHERE c.extensionId = @extensionId",
      parameters: [{ name: "@extensionId", value: theme.extensionId }]
    })
    .fetchAll();

  extension = extensionResources.resources[0];

  context.res = {
    status: theme ? 200 : 404,
    body: { theme, extension }
  };
};

export default httpTrigger;