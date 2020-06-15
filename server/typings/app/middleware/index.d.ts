// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportLogger from '../../../app/middleware/logger';

declare module 'egg' {
  interface IMiddleware {
    logger: typeof ExportLogger;
  }
}
