// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportNotify from '../../../app/controller/notify';

declare module 'egg' {
  interface IController {
    notify: ExportNotify;
  }
}
