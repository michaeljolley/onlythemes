import { AzureFunction, Context } from "@azure/functions";
import axios from 'axios';

import { APIResponse } from '../Models/apiResponse';
import { Extension } from '../Models/extension';
import { MarketplaceResult } from '../Models/marketplaceResult';
import { Manifest } from '../Models/manifest';

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

  context.log(`${timeStamp}: ThemeCollector: Start`);

  _context = context;

  // Hit the VS Code Marketplace API to get themes
  const extensions: Extension[] = await getAllThemes();

  context.log(`Found ${extensions.length} extensions`);

  if (extensions.length > 0) {

    for (const extension of extensions) {

      let shouldProcess = false;
      let savedExtension: Extension;

      const response = await axios(`${process.env.functionsUrl}GetExtension?extensionId=${extension.extensionId}`, {
        validateStatus: (status: number) => status === 200 || status === 404
      });
      if (response.status === 200) {
        savedExtension = await response.data;
        extension.id = savedExtension.id;
        if (new Date(extension.lastUpdated) > new Date(savedExtension.lastUpdated)) {
          shouldProcess = true;
        }
      } else {
        shouldProcess = true;
      }

      if (shouldProcess) {

        // Get manifest
        const extensionManifest = extension.versions[0].files.find(f => f.assetType === 'Microsoft.VisualStudio.Code.Manifest');

        if (extensionManifest) {

          // In manifest, get all themes & call ThemeCollector for each
          const manifest = await getManifest(extensionManifest.source);

          if (manifest && manifest.contributes.themes?.length > 0) {
            axios.post(`${process.env.functionsUrl}ThemeProcessor`, { extension, manifest }, {
              validateStatus: (status: number) => status === 200 || status === 404
            });
          }
        }
      }
    }
  }

  context.log(`${timeStamp}: ThemeCollector: Completed`);
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

    // currentPage++;

    // while (currentPage <= totalPages) {

    //   const marketPlaceResult = await getThemes(currentPage);

    //   if (marketPlaceResult) {
    //     extensions.push(...marketPlaceResult.extensions);
    //   }

    //   currentPage++;
    // }
  }

  return extensions.filter(f =>
    !f.displayName.toLocaleLowerCase().includes('icon') &&
    !f.extensionName.toLocaleLowerCase().includes('icon')
  );
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
    const response = await axios.post(baseUrl, body, {
      headers
    });
    if (response.status === 200) {
      const apiResponse: APIResponse = response.data

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

const getManifest = async (url: string): Promise<Manifest | undefined> => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const manifest: Manifest = response.data
      return manifest;
    }
  }
  catch (err) {
    _context.log(err);
  }
  return undefined;
}

export default timerTrigger;
