import { AzureFunction, Context } from "@azure/functions";
import axios from 'axios';
import { CosmosClient } from "@azure/cosmos";

import { Extension } from "../Models/extension";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });


let _context: Context;

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  var timeStamp = new Date().toISOString();

  context.log(`${timeStamp}: ThemeProcessor: Start`);

  _context = context;

  // Get next 100 extensions to process
  const extensions: Extension[] = await getThemes();

  if (extensions.length > 0) {

    for (const extension of extensions) {

      axios.post(`${process.env.functionsUrl}CreateCI`, { extension }, {
        validateStatus: (status: number) => status === 200 || status === 404
      });

    }
  }

  context.log(`${timeStamp}: ThemeProcessor: Completed`);
};

const getThemes = async (): Promise<Extension[]> => {
  const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
  const { container } = await database.containers.createIfNotExists({ id: "extensions" });

  // Lookup the extensionId in CosmosDb
  const { resources } = await container.items
    .query({
      query: "SELECT TOP 100 * from c WHERE c.lastCataloged < c.lastUpdated ORDER BY c.lastCataloged"
    })
    .fetchAll();

  return resources as Extension[];
}

export default timerTrigger;
