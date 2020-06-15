import {
  Card,
  Spin,
  List,
  Pagination,
  Modal,
  message,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
// import moment from 'moment';
import router from 'umi/router';
import styles from './index.less';

class CreateItem extends PureComponent {
  state = {
    pages:10,
    cur:1,
  };

  handleAdd = () => {
    this.handleModalVisible();
  };

  render() {
    const { cur, pages } = this.state;


    const ListContent = ({ data: { price, discount, amount, store, coupon } }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>店铺名称</p>
          <p>{store.name}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>价格</p>
          <p>{price/100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>优惠金额</p>
          <p>{discount / 100}</p>
        </div>
        {
          coupon?
            <div className={styles.listContentItem}>
              <p>优惠券金额</p>
              <p>{coupon.amount}</p>
            </div>
          :
          null
        }
        <div className={styles.listContentItem}>
          <p>总计</p>
          <p>{amount / 100}</p>
        </div>
        
      </div>
    );

    const Changepage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const jump = (orderId) => {
      router.push(`/OrderList/TakeGoods/TakeOrderDetail/${orderId}`);
    }

    return (
      <PageHeaderWrapper title="取货订单列表">
        <Card bordered={false}>
          <Query
            query={gql`
              query(
                $pageSize: Int,
                $currentPage: Int,
                $status: OrderStatus,
              ){
                orders(
                  input:{
                    pageSize: $pageSize,
                    currentPage: $currentPage,
                    status: $status,
                  }
                ) {
                  list{
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
                  pagination{
                    pageSize
                    total
                    current
                  }
                }
              }
            `}
            variables={{ pageSize: pages, currentPage: cur, status:'fetch' }}
          >
            {({ loading, data:{ orders }, refetch }) => {
              if (loading) return <Spin />;
              refetch();
              const { pagination } = orders;

              return (
                <Mutation
                  mutation={gql`
                    mutation($code: String!){
                      drawItem(code: $code)
                    }
                  `}
                >
                  {mutate=>{
                    const orderData = {};
                    const takeGoods = e => {
                      if (e) {
                        orderData.code = e.code;
                        try {
                          const promise = new Promise(resolve => {
                            console.log('orderId',orderData);
                            
                            resolve(mutate({ variables: orderData }));
                          });
                          promise.then(value => {
                            console.log(value);
                            message.success('取货成功');
                            refetch();
                          });
                        } catch (catchedError) {
                          //
                        }
                      }
                    }
                    return(
                      <PageHeaderWrapper>
                        <div className={styles.standardList}>
                          <List
                            size="large"
                            rowKey="id"
                            loading={loading}
                            dataSource={orders && orders.list ? orders.list : []}
                            renderItem={item => (
                              <List.Item
                                actions={[
                                  <a
                                    onClick={() => {
                                      Modal.confirm({
                                        title: '取货',
                                        content: '确定取货吗？',
                                        okText: '确认',
                                        cancelText: '取消',
                                        onOk: () => takeGoods(item),
                                      });
                                    }}
                                  >
                                    取货
                                  </a>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={<a onClick={()=>jump(item.id)}>[{item.id}]{item.name}</a>}
                                  description={item.content}
                                />
                                <ListContent data={item} />
                              </List.Item>
                            )}
                          />
                          <Pagination
                            current={pagination.current}
                            total={pagination.total}
                            style={{ float:"right" }}
                            onChange={Changepage}
                          />
                        </div>
                      </PageHeaderWrapper>
                    )
                  }}
                </Mutation>
              );
            }}
          </Query>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CreateItem;
