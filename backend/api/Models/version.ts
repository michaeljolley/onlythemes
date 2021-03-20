import { MarketplaceFile } from './marketplaceFile';
import { Property } from './property';

export interface Version {
  version: string;
  properties: Property[]
  files: MarketplaceFile[]
}