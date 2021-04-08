import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";
import { Extension } from "../Models/extension";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
    const { container } = await database.containers.createIfNotExists({ id: "extensions" });

    const { resources } = await container.items
        .query({
            query: "SELECT c.id, c.extensionId, c.statistics from c"
        })
        .fetchAll();

    const extensions = resources.map((extension: Extension) => {
        return JSON.stringify({
            id: extension.id,
            extensionId: extension.extensionId,
            weightedRating: extension.statistics.find(f => f.statisticName == "weightedRating")?.value
        });
    }).join("\n");

    context.res = {
        status: 200,
        body: extensions
    };
};

export default httpTrigger;