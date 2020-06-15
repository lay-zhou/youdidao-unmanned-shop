import { Spin, List, Pagination, Card } from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './index.less';

class storeImage extends PureComponent {
  state = {
    pages:10,
    cur:1,
  }

  render() {
    const { cur, pages } = this.state;
    // 截取路由
    const urlParams = new URL(window.location.href);
    const { hash } = urlParams;
    const userId = hash.split('OrderList/')[1];
    console.log("userId", userId);
    const listName=hash.split('/')[2];
    console.log('listName',listName);

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

    const ChangePage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const jump = (orderId) => {
      router.push(`/Users/${listName}/OrderList/OrderDetail/${orderId}`);
    }

    return (
      <Query
        query={gql`
            query($userId: ID,$pageSize: Int, $currentPage: Int){
              orders(input: {
                userId: $userId,
                pageSize: $pageSize,
                currentPage: $currentPage,
              }){
                list{
                  id
                  price
                  discount
                  amount
                  code
                  qrCode
                  time
                  createdAt
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
                  }
                  coupon{
                    id
                    amount
                    require
                    usedAt
                    expiredDate
                    type
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
                pagination{
                  pageSize
                  total
                  current
                }
              }
            }
          `}
        variables={{ pageSize: pages, currentPage: cur, }}
      >
        {({ loading, data: { orders }, refetch }) => {
          if (loading) return <Spin />
          refetch();
          console.log('orders', orders);
          const { pagination, list } = orders;
          return (
            <PageHeaderWrapper>
              <Card className={styles.standardList}>
                <List
                  size="large"
                  rowKey="id"
                  loading={loading}
                  dataSource={list || []}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={<a onClick={()=>jump(item.id)}>[{item.id}]</a>}
                      />
                      <ListContent data={item} />
                    </List.Item>
                  )}
                />
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  style={{ float:"right" }}
                  onChange={ChangePage}
                />
              </Card>
            </PageHeaderWrapper>
          );
        }}
      </Query>
    )
  }
}

export default storeImage;
