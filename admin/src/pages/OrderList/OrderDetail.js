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
                orderItem{
                  id
                  imageUrl
                  title
                  price
                  amount
                  number
                }
                trade{
                  id
                  price
                  status
                }
                user{
                  id
                  imageUrl
                  nickname
                  balance
                  point
                  role
                  phone
                }
                store{
                  id
                  imageUrl
                  name
                  address
                  longitude
                  latitude
                  distance
                  sales
                  balance
                  status
                }
                coupon{
                  id
                  amount
                  require
                  usedAt
                  expiredDate
                }
              }
            }
          `}
          variables={{ id: itemId }}
        >
          {({ loading, data:{order}, refetch }) => {
            if (loading) return <Spin />
            
            refetch();
            const{orderItem,user,store,coupon} = order;
            console.log('orderItem',orderItem);
            if (user) {
              switch (user.role) {
                case 'admin':
                  user.role = '管理员';
                  break;
                case 'facilitator':
                  user.role = '服务商';
                  break;
                case 'financial':
                  user.role = '财务';
                  break;
                case 'merchant':
                  user.role = '商户';
                  break;
                case 'keep':
                  user.role = '商户管理员';
                  break;
                case 'advertising':
                  user.role = '广告管理员';
                  break;
                case 'commodity':
                  user.role = '商品管理员';
                  break;
                case 'member':
                  user.role = '会员';
                  break;
                case 'user':
                  user.role = '用户';
                  break;
                default:
                  break;
              }
            } else {
              user.role = '未知权限';
            }
            
            return (
              <PageHeaderWrapper title="订单详情页" loading={loading}>
                <Card bordered={false}>
                  <DescriptionList size="large" title="订单基础信息" style={{ marginBottom: 32 }}>
                    <Description style={{ width:"50%" }} term="订单ID">{order.id}</Description>
                    <Description style={{ width:"50%" }} term="角色类型">{user.role}</Description>
                    <Description style={{ width:"50%" }} term="店铺名称">{store.name}</Description>
                    <Description style={{ width:"50%" }} term="订单价格">{order.price/100}</Description>
                    <Description style={{ width:"50%" }} term="订单优惠价格">{order.discount/100}</Description>
                    {
                      coupon?
                        <Description style={{ width:"50%" }} term="优惠券金额">{coupon.amount/100 + (coupon.require)}</Description>
                      :null
                    }
                    <Description style={{ width:"50%" }} term="总计">{order.amount/100}</Description>
                    <Description style={{ width:"50%" }} term="取货码">{order.code}</Description>
                    <Description style={{ width:"50%" }} term="时间">{order.time}</Description>
                    <Description style={{ width:"50%" }} term="订单状态">已支付</Description>
                  </DescriptionList>
                  <Divider style={{ marginBottom: 32 }} />
                  {
                    orderItem ? orderItem.map((item,index) => (
                      <DescriptionList size="large" title={`商品列表${index+1}`} key={item.id} style={{ marginBottom: 32 }}>
                        <Description style={{ width:"50%" }} term="商品名称">{item.title}</Description>
                        <Description style={{ width:"50%" }} term="商品图片"><img src={item.imageUrl} alt='' width='24' /></Description>
                        <Description style={{ width:"50%" }} term="商品价格">{item.amount/100}</Description>
                        <Description style={{ width:"50%" }} term="商品数量">{item.number}</Description>
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
