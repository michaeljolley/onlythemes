import { MarketplacePublisher } from './marketplacePublisher';
import { Statistic } from './statistic';
import { Version } from './version';

export interface Extension {
  publisher: MarketplacePublisher;
  extensionId: string;
  extensionName: string;
  displayName: string;
  lastUpdated: Date;
  publishedDate: Date;
  releaseDate: Date;
  shortDescription: string;
  statistics: Statistic[];
  versions: Version[];
  id?: string;
  imageData?: unknown;
  metaData?: unknown;
}