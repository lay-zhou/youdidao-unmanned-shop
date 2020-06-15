import { Subscription } from 'egg';
// tslint:disable-next-line: class-name
class updateAliyAccessToken extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            cron: '0 0 */3 * * *',
            type: 'worker',
            immediate: true,
        };
    }
    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        // subscribe 是真正定时任务执行时被运行的函数
        console.log('执行百度token获取操作！');
        const { data: {
            access_token: baiduAccessToken
        } } = await this.ctx.curl(`https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=iWhufNebaSVxlO7oCHhISwTM&client_secret=22iEQ6KheT5jRj0fsfAgvxBEYGdkWSfE`, {
            dataType: 'json',
        });
        console.log('baiduAccessToken', baiduAccessToken);
        await this.app.redis.set('baiduAccessToken', baiduAccessToken);
        console.log('执行百度token获取操作成功！');
    }
}
module.exports = updateAliyAccessToken;