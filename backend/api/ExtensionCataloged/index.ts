import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Extension } from "../Models/extension";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const extensionId: string = req.query.extensionId;

  context.log(`ExtensionCataloged: ${extensionId}`);

  if (extensionId) {

    try {
      const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
      const { container } = await database.containers.createIfNotExists({ id: "extensions" });

      const { resources } = await container.items
        .query({
          query: "SELECT * from c WHERE c.extensionId = @extensionId",
          parameters: [{ name: "@extensionId", value: extensionId }]
        })
        .fetchAll();

      const extension = resources[0] as Extension;

      if (extension) {
        extension.lastCataloged = new Date();

        const { resource } = await container.items.upsert(extension);
        context.res = {
          status: 200,
          body: resource.id
        };
      } else {
        context.res = {
          status: 404
        };
      }
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
