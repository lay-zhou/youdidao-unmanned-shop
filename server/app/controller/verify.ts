import { Controller } from 'egg';

export default class VerifyController extends Controller {
  // https验证
  public async index() {
    const { ctx } = this;
    ctx.body = 'xxxx';
  }
}
