import { ContainerExecRequestTerminalSize } from "@azure/arm-containerinstance/esm/models/mappers";
import { AzureFunction, Context } from "@azure/functions";
import axios from 'axios';
import * as redis from 'redis';

import { MLRecommendation, Recommendation } from '../Models/recommendation';

const mlEndpoint = process.env.ML_ENDPOINT;
const mlAuthToken = process.env.ML_AUTH_TOKEN;
const redisEndpoint = process.env.REDIS_ENDPOINT;
const redisKey = process.env.REDIS_KEY;
const redisPort = parseInt(process.env.REDIS_PORT);

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  var timeStamp = new Date().toISOString();

  const recommendations = await getRecommendations(context);

  if (recommendations.length > 0) {
    // Save them to Redis
    await saveRecommendations(recommendations);
  }

  context.log(`${timeStamp}: RecommendationUpdate: Completed`);
};

const getRecommendations = async (context: Context): Promise<Array<Recommendation>> => {

  const headers = {
    Authorization: `Bearer ${mlAuthToken}`,
    'Content-Type': 'application/json'
  };

  try {

  const response = await axios.post(mlEndpoint,
  {
    Inputs: {
      "user": [
        {
          "userId": "e283708e-f3a6-4dcd-8175-ba639bd73dc5",
          "themeId": "70540c3b-2ec7-41fc-81cc-62e14e903032",
          "rating": 100
        }
      ]
    }
  },
  {
    headers
  });

  if (response && response.status === 200) {

    const mlRecommendations: MLRecommendation = response.data;

    return mlRecommendations.Results.recommendations.map(m => new Recommendation(m.User, m.Item, m["Scored Rating"]));
  }
  }
  catch(err) {
    context.log(err);
  }

  return [];
}

const saveRecommendations = async (recommendations: Array<Recommendation>): Promise<void> => {
  
  const client = redis.createClient(redisPort, redisEndpoint,
    {auth_pass: redisKey, tls: {servername: redisEndpoint}});


  const users = [...new Set(recommendations.map(item => item.userId))];

  for (const user of users) {
    await new Promise((resolve, reject) => {
      client.set(user, JSON.stringify(recommendations.filter(m => m.userId === user)), (err, res) => {
        resolve(null);
      });
    });
  }
}

export default timerTrigger;
