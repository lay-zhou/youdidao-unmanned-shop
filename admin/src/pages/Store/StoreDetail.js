import { Card, Spin, } from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DescriptionList from '@/components/DescriptionList';

const { Description } = DescriptionList;

class StoreDetail extends PureComponent {
    state = {
        
    }

    render(){

      // 截取路由
      const urlParams = new URL(window.location.href);
      const { hash } = urlParams;
      const itemId = hash.split('StoreDetail/')[1];

      return(
        <Query
          query={gql`
            query(
              $id: ID!
            ){
              store(id: $id){
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
            }
          `}
          variables={{ id: itemId }}
        >
          {({ loading, data:{store}, refetch }) => {
            if (loading) return <Spin />
            console.log('store',store);
            
            refetch();
            return (
              <PageHeaderWrapper title="订单详情页" loading={loading}>
                <Card bordered={false}>
                  <DescriptionList size="large" title="订单基础信息" style={{ marginBottom: 32 }}>
                    <Description style={{ width:"50%" }} term="店铺ID">{store.id}</Description>
                    <Description style={{ width:"50%" }} term="店铺名称">{store.name}</Description>
                    <Description style={{ width:"50%" }} term="店铺图片">{<img alt='' src={store.imageUrl} width='50' />}</Description>
                    <Description style={{ width:"50%" }} term="店铺地址">{store.address}</Description>
                    <Description style={{ width:"50%" }} term="店铺经度">{store.longitude}</Description>
                    <Description style={{ width:"50%" }} term="店铺纬度">{store.latitude}</Description>
                    <Description style={{ width:"50%" }} term="店铺总销售额">{store.sales/100}</Description>
                    <Description style={{ width:"50%" }} term="店铺余额">{store.balance/100}</Description>
                  </DescriptionList>
                </Card>
              </PageHeaderWrapper>
            );
            }}
        </Query>
      )
    }
}

export default StoreDetail;
