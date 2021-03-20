import { Extension } from "./extension";

export interface APIResponse {
  results: APIResult[];
}

export interface APIResult {
  extensions: Extension[];
  resultMetadata: MetadataResponse[]
}

export interface MetadataResponse {
  metadataType: string;
  metadataItems: MetadataItem[];
}

export interface MetadataItem {
  name: string;
  count: number;
}
