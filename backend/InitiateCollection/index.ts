import { AzureFunction, Context } from "@azure/functions";
import fetch from 'node-fetch';
import { APIResponse } from '../Models/apiResponse';
import { Extension } from '../Models/extension';
import { MarketplaceResult } from '../Models/marketplaceResult';

const baseUrl = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
const headers = {
  'User-Agent': 'OnlyThemes',
  'Content-Type': 'application/json',
  Accept: 'application/json;api-version=3.0-preview.1'
};
const pageSize = 100;

let _context: Context;

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  var timeStamp = new Date().toISOString();

  context.log(`${timeStamp}: InitiateCollection: Start`);

  _context = context;

  // Hit the VS Code Marketplace API to get themes
  const extensions: Extension[] = await getAllThemes();

  context.log(`Found ${extensions.length} extensions`);

  // Iterate through themes & pages of themes

  // For each theme, call ThemeCollector Durable Function

  context.log(`${timeStamp}: InitiateCollection: Completed`);
};

const getAllThemes = async (): Promise<Extension[]> => {

  let currentPage: number = 0;
  let currentTotal: number = 0;
  let totalPages: number = 0;
  let extensions: Extension[] = [];

  const initialResult = await getThemes(currentPage);

  if (initialResult) {
    extensions = initialResult.extensions;
    currentTotal = initialResult.totalCount;
    totalPages = Math.ceil(currentTotal / pageSize);

    currentPage++;

    while (currentPage <= totalPages) {

      const marketPlaceResult = await getThemes(currentPage);

      if (marketPlaceResult) {
        extensions.push(...marketPlaceResult.extensions);
      }

      currentPage++;
    }
  }

  return extensions;
}

const getThemes = async (page: Number): Promise<MarketplaceResult | undefined> => {

  const body = {
    filters: [
      {
        criteria: [
          { filterType: 8, value: 'Microsoft.VisualStudio.Code' },
          { filterType: 10, value: 'target:"Microsoft.VisualStudio.Code"' },
          { filterType: 12, value: '5122' },
          { filterType: 5, value: 'Themes' },
        ],
        direction: 2, // Not sure what this does.
        pageSize,
        pageNumber: page,
        sortBy: 4, // Sorts by most downloads.
        sortOrder: 0,
      },
    ],
    flags: 914, // Settings flags to 914 will return the github link.
  };

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const apiResponse: APIResponse = await response.json();

      if (apiResponse.results && apiResponse.results.length > 0) {
        const extensions = apiResponse.results[0].extensions;
        const resultCount = apiResponse.results[0].resultMetadata.find(f => f.metadataType === 'ResultCount' && f.metadataItems.length > 0);
        let totalCount: number;
        if (resultCount) {
          totalCount = resultCount.metadataItems[0].count;
        }

        const marketplaceResult: MarketplaceResult = {
          extensions,
          totalCount
        }

        return marketplaceResult;
      }
    }
  }
  catch (err) {
    _context.log(err);
  }
  return undefined;
}

export default timerTrigger;

