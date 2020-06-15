import React, { Component, Fragment } from 'react';
import { 
  Card,
  message,
  Spin,
  Divider,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DescriptionList from '@/components/DescriptionList';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Button } from 'antd/lib/radio';
import router from 'umi/router';
// import gql from 'graphql-tag';

const { Description } = DescriptionList;

class SearchList extends Component {
  state = {
    
  }

  render() {
    const { submitting } = this.props;

    // 截取路由
    const urlParams = new URL(window.location.href);
    const { hash } = urlParams;
    const orderId = hash.split('CheckDetail/')[1];

    return (
      <PageHeaderWrapper title="订单核验">
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
                status
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
          variables={{ id: orderId }}
        >
          {({ loading, data, refetch,error }) => {
            if (loading) return <Spin />
            if (error) {
              message.error('订单ID输入错误');
              router.push(`/CheckOrder`);
            }
            console.log('data',data);

            const { order } = data;

            const { orderItem, user, store } = order;
            
            refetch();
            return (
              <Mutation
                mutation={gql`
                  mutation($code: String!){
                    drawItem(code: $code)
                  }
                `}
              >
                {mutate => {
                  const checkItem = () => {
                    if (order.status === 'fetch') {
                      const checkData = {};
                      checkData.code = order.code;
                      try{
                        const promise = new Promise(resolve => {
                          console.log('checkData', checkData);
                          resolve(mutate({ variables: checkData }));
                        });
                        promise.then(value => {
                          console.log(value);
                          message.success('核验成功');
                          // router.push(`/CheckOrder`);
                        });
                      } catch (catchedError) {
                        //
                      }
                    } else {
                      message.error('订单未备货，请先备货！');
                    }
                  };
                  return(
                    <Fragment>
                      {
                        data?
                          <Card
                            style={{ marginTop: 24 }}
                            bordered={false}
                            bodyStyle={{ padding: '8px 32px 32px 32px' }}
                          >
                            <DescriptionList size="large" title="订单基础信息" style={{ marginBottom: 32 }}>
                              <Description style={{ width:"50%" }} term="下单人">{user.nickname}</Description>
                              <Description style={{ width:"50%" }} term="店铺名称">{store.name}</Description>
                              <Description style={{ width:"50%" }} term="订单价格">{order.price/100}</Description>
                              <Description style={{ width:"50%" }} term="订单优惠价格">{order.discount/100}</Description>
                              <Description style={{ width:"50%" }} term="优惠券金额">{order.coupon/100}</Description>
                              <Description style={{ width:"50%" }} term="总计">{order.amount/100}</Description>
                              <Description style={{ width:"50%" }} term="取货码">{order.code}</Description>
                              <Description style={{ width:"50%" }} term="取货时间">{order.time}</Description>
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
                            <div style={{textAlign:'center' }}>
                              <Button 
                                htmlType="submit"
                                loading={submitting}
                                onClick={checkItem}
                              >
                                核验
                              </Button>
                            </div>
                          </Card>
                        : null
                      }
                    </Fragment>
                  )
                }}
              </Mutation>
            );
          }}
        </Query> 
      </PageHeaderWrapper>
    );
  }
}

export default SearchList;
