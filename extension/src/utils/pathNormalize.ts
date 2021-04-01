import * as path from 'path';
import { OSType } from "../enums";

/**
 * Normalizes a path based on the platforms OS
 * @param targetPath Path to normalize
 * @param platformOS Platform to format path for
 */
export function pathNormalize(targetPath: string, platformOS?: OSType): string {
  return platformOS === OSType.windows ?
    path.win32.normalize(targetPath).replace(/\//g, '\\') :
    path.posix.normalize(targetPath).replace(/\\/g, '/');
}