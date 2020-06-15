import { AuthenticationError } from 'apollo-server';
import { Service } from 'egg';

export default class DetectionService extends Service {
    async error(params) {
        switch (params) {
            case 'already':
                throw new AuthenticationError('该项已存在！');
            case 'nonentity':
                throw new AuthenticationError('取货码不存在！');
            case 'notMatching':
                throw new AuthenticationError('该信息不匹配！');
            case 'unpaid':
                throw new AuthenticationError('该订单未支付！');
            case 'paid':
                throw new AuthenticationError('该订单备货中！');
            case 'completed':
                throw new AuthenticationError('该订单已完成！');
            case 'codeErr':
                throw new AuthenticationError('参数有误！');
            default:
                break;
        }
    }
}
