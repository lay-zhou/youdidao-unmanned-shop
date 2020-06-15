// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBalance from '../../../app/service/balance';
import ExportBanner from '../../../app/service/banner';
import ExportCard from '../../../app/service/card';
import ExportCoupon from '../../../app/service/coupon';
import ExportDetection from '../../../app/service/detection';
import ExportDispose from '../../../app/service/dispose';
import ExportExchange from '../../../app/service/exchange';
import ExportFile from '../../../app/service/file';
import ExportIssueCoupon from '../../../app/service/issueCoupon';
import ExportItem from '../../../app/service/item';
import ExportItemClassify from '../../../app/service/item_classify';
import ExportMath from '../../../app/service/math';
import ExportOrder from '../../../app/service/order';
import ExportPaySuccess from '../../../app/service/pay_success';
import ExportPhone from '../../../app/service/phone';
import ExportPoint from '../../../app/service/point';
import ExportProject from '../../../app/service/project';
import ExportSmsCode from '../../../app/service/sms_code';
import ExportStore from '../../../app/service/store';
import ExportToken from '../../../app/service/token';
import ExportTopUp from '../../../app/service/top_up';
import ExportUser from '../../../app/service/user';
import ExportUsers from '../../../app/service/users';
import ExportWithdrawal from '../../../app/service/withdrawal';
import ExportWxBizData from '../../../app/service/wx_biz_data';
import ExportWxFile from '../../../app/service/wx_file';

declare module 'egg' {
  interface IService {
    balance: ExportBalance;
    banner: ExportBanner;
    card: ExportCard;
    coupon: ExportCoupon;
    detection: ExportDetection;
    dispose: ExportDispose;
    exchange: ExportExchange;
    file: ExportFile;
    issueCoupon: ExportIssueCoupon;
    item: ExportItem;
    itemClassify: ExportItemClassify;
    math: ExportMath;
    order: ExportOrder;
    paySuccess: ExportPaySuccess;
    phone: ExportPhone;
    point: ExportPoint;
    project: ExportProject;
    smsCode: ExportSmsCode;
    store: ExportStore;
    token: ExportToken;
    topUp: ExportTopUp;
    user: ExportUser;
    users: ExportUsers;
    withdrawal: ExportWithdrawal;
    wxBizData: ExportWxBizData;
    wxFile: ExportWxFile;
  }
}
