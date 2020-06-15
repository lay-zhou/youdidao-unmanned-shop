// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/model/account';
import ExportAddress from '../../../app/model/address';
import ExportBalance from '../../../app/model/balance';
import ExportBanner from '../../../app/model/banner';
import ExportCard from '../../../app/model/card';
import ExportConfig from '../../../app/model/config';
import ExportCoupon from '../../../app/model/coupon';
import ExportDistributionUser from '../../../app/model/distribution_user';
import ExportDraw from '../../../app/model/draw';
import ExportFile from '../../../app/model/file';
import ExportFollow from '../../../app/model/follow';
import ExportIssueCoupon from '../../../app/model/issue_coupon';
import ExportItem from '../../../app/model/item';
import ExportItemClassify from '../../../app/model/item_classify';
import ExportItemImage from '../../../app/model/item_image';
import ExportOnSaleItem from '../../../app/model/on_sale_item';
import ExportOrder from '../../../app/model/order';
import ExportOrderItem from '../../../app/model/order_item';
import ExportPhone from '../../../app/model/phone';
import ExportPoint from '../../../app/model/point';
import ExportProject from '../../../app/model/project';
import ExportSmsCode from '../../../app/model/sms_code';
import ExportStore from '../../../app/model/store';
import ExportTopUpTrade from '../../../app/model/topUp_trade';
import ExportTopUp from '../../../app/model/top_up';
import ExportTopUpOrder from '../../../app/model/top_up_order';
import ExportTopUpRecord from '../../../app/model/top_up_record';
import ExportTrade from '../../../app/model/trade';
import ExportUser from '../../../app/model/user';
import ExportWechatAccount from '../../../app/model/wechat_account';
import ExportWithdrawal from '../../../app/model/withdrawal';

declare module 'sequelize' {
  interface Sequelize {
    Account: ReturnType<typeof ExportAccount>;
    Address: ReturnType<typeof ExportAddress>;
    Balance: ReturnType<typeof ExportBalance>;
    Banner: ReturnType<typeof ExportBanner>;
    Card: ReturnType<typeof ExportCard>;
    Config: ReturnType<typeof ExportConfig>;
    Coupon: ReturnType<typeof ExportCoupon>;
    DistributionUser: ReturnType<typeof ExportDistributionUser>;
    Draw: ReturnType<typeof ExportDraw>;
    File: ReturnType<typeof ExportFile>;
    Follow: ReturnType<typeof ExportFollow>;
    IssueCoupon: ReturnType<typeof ExportIssueCoupon>;
    Item: ReturnType<typeof ExportItem>;
    ItemClassify: ReturnType<typeof ExportItemClassify>;
    ItemImage: ReturnType<typeof ExportItemImage>;
    OnSaleItem: ReturnType<typeof ExportOnSaleItem>;
    Order: ReturnType<typeof ExportOrder>;
    OrderItem: ReturnType<typeof ExportOrderItem>;
    Phone: ReturnType<typeof ExportPhone>;
    Point: ReturnType<typeof ExportPoint>;
    Project: ReturnType<typeof ExportProject>;
    SmsCode: ReturnType<typeof ExportSmsCode>;
    Store: ReturnType<typeof ExportStore>;
    TopUpTrade: ReturnType<typeof ExportTopUpTrade>;
    TopUp: ReturnType<typeof ExportTopUp>;
    TopUpOrder: ReturnType<typeof ExportTopUpOrder>;
    TopUpRecord: ReturnType<typeof ExportTopUpRecord>;
    Trade: ReturnType<typeof ExportTrade>;
    User: ReturnType<typeof ExportUser>;
    WechatAccount: ReturnType<typeof ExportWechatAccount>;
    Withdrawal: ReturnType<typeof ExportWithdrawal>;
  }
}
