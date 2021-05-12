import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient, Database } from "@azure/cosmos";
import * as redis from 'redis';

import { Extension } from "../Models/extension";
import { Theme } from "../Models/theme";
import { Recommendation } from '../Models/recommendation';

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const redisEndpoint = process.env.REDIS_ENDPOINT;
const redisKey = process.env.REDIS_KEY;
const redisPort = parseInt(process.env.REDIS_PORT);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  let theme: Theme | undefined;
  let extension: Extension | undefined;
  const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
 
  const userId = req.query.userId || '';

  const recommendations = await getRecommendations(userId);

  // Array of themeIds
  const seenThemes = await getSeenThemes(database, userId);

  const themeRecId = recommendTheme(recommendations, seenThemes);

  const extensionContainer = await database.containers.createIfNotExists({ id: "extensions" });
  const { container } = await database.containers.createIfNotExists({ id: "themes" });

  if (themeRecId) {
    const { resources } = await container.items
      .query({
        query: "SELECT * from c WHERE c.id = @themeId",
        parameters: [{ name: "@themeId", value: themeRecId }]
      })
      .fetchAll();

    theme = resources[0];
  }
  else {
    const { resources } = await container.items
      .query({
        query: "SELECT TOP 1000 * from c WHERE c.imageCaptured=true"
      })
      .fetchAll();

    const randomIndex = Math.floor(Math.random() * (resources.length - 0 + 1)) + 0;

    theme = resources[randomIndex];
  }

  const extensionResources = await extensionContainer.container.items
    .query({
      query: "SELECT * from c WHERE c.extensionId = @extensionId",
      parameters: [{ name: "@extensionId", value: theme.extensionId }]
    })
    .fetchAll();

  extension = extensionResources.resources[0];

  await recordUserTheme(database, theme.id, userId);

  context.res = {
    status: theme ? 200 : 404,
    body: { theme, extension }
  };
};

const getRecommendations = async (userId: string): Promise<Array<Recommendation>> => {
 
  const client = redis.createClient(redisPort, redisEndpoint,
    {auth_pass: redisKey, tls: {servername: redisEndpoint}});

    try {
      const recommendations: string = await new Promise((resolve, reject) => {
        client.get(userId, (err, res) => {
          if (err) reject(err);
          resolve(res);
        });
      });

      return recommendations ? JSON.parse(recommendations) : [];
    }
    catch (err) {
      return [];
    }
}

const recommendTheme = (recommendations: Array<Recommendation>, seenThemeIds: Array<string>): string | undefined => {
  if (recommendations.length > 0) {
    const userRecThemeIds = recommendations
                            .sort((a, b) => a.score - b.score)
                            .filter(f => seenThemeIds.indexOf(f.themeId) < 0 &&
                                          f.score > 0);

    return userRecThemeIds.length > 0 ?
            userRecThemeIds[0].themeId : null;
  }
  return null;
}

const getSeenThemes = async (database: Database, userId: string) : Promise<Array<string>> => {

  const { container } = await database.containers.createIfNotExists({ id: "userThemes" });

  var priordate = new Date();
  priordate.setDate((new Date()).getDate() - 90);

  const userThemes = await container.items
    .query({
      query: "SELECT * from c WHERE c.userId = @userId and c.dateLastSeen > @lastSeen",
      parameters: [
        { name: "@userId", value: userId },
        { name: "@lastSeen", value: priordate.toISOString() }
      ]
    })
    .fetchAll();

  if (userThemes.resources) {
    return userThemes.resources.map(m => m.themeId);
  }
  return [];
}

const recordUserTheme = async (database: Database, themeId: string, userId: string) : Promise<void> => {
  const { container } = await database.containers.createIfNotExists({ id: "userThemes" });

  await container.items.upsert({
    userId,
    themeId,
    dateLastSeen: new Date().toISOString()
  });
}

export default httpTrigger;