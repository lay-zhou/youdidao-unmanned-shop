import { Card, Spin } from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DescriptionList from '@/components/DescriptionList';

const { Description } = DescriptionList;

class GoodDetail extends PureComponent {
    state = {
        
    }

    render(){

      // 截取路由
      const urlParams = new URL(window.location.href);
      const { hash } = urlParams;
      const itemId = hash.split('GoodDetail/')[1];

      console.log('itemId',itemId);
      return(
        <Query
          query={gql`
            query(
              $code: ID!
            ){
              item(code: $code){
                code
                name
                imageUrl
                content
                originalPrice
                pointDiscountPrice
                price
                unit
                stock
                type
                status
              }
            }
          `}
          variables={{ code: itemId }}
        >
          {({ loading, data:{item}, refetch }) => {
            if (loading) return <Spin />
            console.log('item',item);
            refetch();
            return (
              <PageHeaderWrapper title="商品详情页" loading={loading}>
                <Card bordered={false}>
                  <DescriptionList size="large" title="商品基础信息" style={{ marginBottom: 32 }}>
                    <Description style={{ width:"50%" }} term="商品条形码">{item.code}</Description>
                    <Description style={{ width:"50%" }} term="商品名称">{item.name}</Description>
                    <Description style={{ width:"50%" }} term="商品图片">{<img alt='' src={item.imageUrl} width='50' />}</Description>
                    <Description style={{ width:"50%" }} term="商品简介">{item.content}</Description>
                    <Description style={{ width:"50%" }} term="商品类型">{item.type === 'ordinary'? '可退款类型':'不可退款类型'}</Description>
                    <Description style={{ width:"50%" }} term="商品原价">{item.originalPrice/100}</Description>
                    <Description style={{ width:"50%" }} term="积分最大抵扣金额">{item.pointDiscountPrice/100}</Description>
                    <Description style={{ width:"50%" }} term="商品单价">{item.price/100}</Description>
                    <Description style={{ width:"50%" }} term="商品单位">{item.unit}</Description>
                    <Description style={{ width:"50%" }} term="商品库存">{item.stock}</Description>
                  </DescriptionList>
                </Card>
              </PageHeaderWrapper>
            );
            }}
        </Query>
      )
    }
}

export default GoodDetail;
