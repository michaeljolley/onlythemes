import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Extension } from "../Models/extension";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const extensionId: string | undefined = req.query.extensionId;
    let extension: Extension | undefined;

    if (extensionId) {
        const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
        const { container } = await database.containers.createIfNotExists({ id: "extensions" });

        // Lookup the extensionId in CosmosDb
        const { resources } = await container.items
            .query({
                query: "SELECT * from c WHERE c.extensionId = @extensionId",
                parameters: [{ name: "@extensionId", value: extensionId }]
            })
            .fetchAll();

        extension = resources[0];
    }

    context.res = {
        status: extension ? 200 : 404,
        body: extension
    };
};

export default httpTrigger;