import { Card, Spin, Divider } from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DescriptionList from '@/components/DescriptionList';
// import moment from 'moment';
// import styles from './index.less';

const { Description } = DescriptionList;
// const QRCode = require('qrcode.react');

class storeImage extends PureComponent {
    state = {
        
    }

    render(){

      // 截取路由
      const urlParams = new URL(window.location.href);
      const { hash } = urlParams;
      const itemId = hash.split('OrderDetail/')[1];

      return(
        <Query
          query={gql`
            query($id:ID!){
              order(id: $id){
                id
                price
                discount
                amount
                code
                time
                orderItem{
                  id
                  imageUrl
                  title
                  price
                  amount
                  number
                }
                store{
                  id
                  name
                  address
                }
                coupon{
                  id
                  amount
                  require
                  usedAt
                  expiredDate
                }
                status
                type
                pointDiscountPrice
                payment
                distributionUser{
                  name
                  phone
                }
              }
            }
          `}
          variables={{ id: itemId }}
        >
          {({ loading, data:{order}, refetch }) => {
            if (loading) return <Spin />
            refetch();
            console.log('order',order);
            const{orderItem,store,coupon} = order;
            // 订单状态
            const orderStatus={};
            switch (order.status) {
              case 'paid': 
                orderStatus.status='已支付';
                break;
              case 'fetch': 
                orderStatus.status='待取货';
                break;
              default:
                orderStatus.status='已完成';
                break;
            }
            // 配送类型
            const orderType={};
            switch (order.type) {
              case 'distribution': 
                orderType.type='配送类型';
                break;
              case 'unmanned': 
                orderType.type='自提类型';
                break;
              case 'storeBuy': 
                orderType.type='店铺直购';
                break;
              default:
                  orderType.type='合并类型';
                break;
            }

            return (
              <PageHeaderWrapper title="订单详情页" loading={loading}>
                <Card bordered={false}>
                  <DescriptionList size="large" title="订单基础信息" style={{ marginBottom: 32 }}>
                    <Description style={{ width:"50%" }} term="订单ID">{order.id}</Description>
                    <Description style={{ width:"50%" }} term="店铺名称">{store.name}</Description>
                    <Description style={{ width:"50%" }} term="店铺地址">{store.address}</Description>
                    <Description style={{ width:"50%" }} term="订单价格">{order.price/100}</Description>
                    <Description style={{ width:"50%" }} term="订单优惠金额">{order.discount/100}</Description>
                    {
                      coupon?
                        <Description style={{ width:"50%" }} term="优惠券金额">{coupon.amount/100 + (coupon.require)}</Description>
                      :null
                    }
                    <Description style={{ width:"50%" }} term="总计">{order.amount/100}</Description>
                    <Description style={{ width:"50%" }} term="取货码">{order.code}</Description>
                    <Description style={{ width:"50%" }} term="配送时间">{order.time}</Description>
                    <Description style={{ width:"50%" }} term="订单状态">{orderStatus.status}</Description>
                    <Description style={{ width:"50%" }} term="购买方式">{orderType.type}</Description>
                    <Description style={{ width:"50%" }} term="积分抵扣金额">{order.pointDiscountPrice/100}</Description>
                    <Description style={{ width:"50%" }} term="支付方式">{order.payment==='wechatPay'?'微信支付':'余额支付'}</Description>
                    <Description style={{ width:"50%" }} term="配送人">{order.distributionUser.name}</Description>
                    <Description style={{ width:"50%" }} term="配送人电话">{order.distributionUser.phone}</Description>
                  </DescriptionList>
                  <Divider style={{ marginBottom: 32 }} />
                  {
                    orderItem ? orderItem.map((item,index) => (
                      <DescriptionList size="large" title={`订单列表${index+1}`} key={item.id} style={{ marginBottom: 32 }}>
                        <Description style={{ width:"50%" }} term="订单名称">{item.title}</Description>
                        <Description style={{ width:"50%" }} term="订单图片"><img src={item.imageUrl} alt='' width='24' /></Description>
                        <Description style={{ width:"50%" }} term="实际支付价格">{item.amount/100}</Description>
                        <Description style={{ width:"50%" }} term="下单数量">{item.number}</Description>
                      </DescriptionList>
                    ))
                    :'无商品'
                  }
                </Card>
              </PageHeaderWrapper>
            );
            }}
        </Query>
      )
    }
}

export default storeImage;
