import { AzureFunction, Context } from "@azure/functions";
import axios from 'axios';

import { AzureCI } from "../Azure/azureCI";

let _context: Context;

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  var timeStamp = new Date().toISOString();

  context.log(`${timeStamp}: CleanCI: Start`);

  _context = context;

  const azureCI = new AzureCI();
  await azureCI.cleanCI();

  context.log(`${timeStamp}: CleanCI: Completed`);
};

export default timerTrigger;
