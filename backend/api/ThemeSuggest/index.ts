import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Theme } from "../Models/theme";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const userId: string | undefined = req.query.userId;
    let theme: Theme | undefined;

    const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
    const { container } = await database.containers.createIfNotExists({ id: "themes" });


    const sprocId = "getRandomTheme";

    const response = await container.scripts.storedProcedure(sprocId).execute(undefined);

    const { randomTheme } = response.resource;


    // Lookup the themeId in CosmosDb
    const { resources } = await container.items
        .query({
            query: "SELECT * from c WHERE c.id = @themeId",
            parameters: [{ name: "@themeId", value: randomTheme.id }]
        })
        .fetchAll();

    theme = resources[0];

    context.res = {
        status: theme ? 200 : 404,
        body: theme
    };
};

export default httpTrigger;