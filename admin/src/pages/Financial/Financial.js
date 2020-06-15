import {
  Spin,
  List,
  Pagination,
  Row, 
  Col,
  Card,
} from 'antd';
import gql from 'graphql-tag';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { ChartCard, Field } from '@/components/Charts';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
// import moment from 'moment';
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

    const topColResponsiveProps = {
      xs: 6,
      sm: 6,
      md: 6,
      lg: 6,
      xl: 6,
      style: { marginBottom: 24 },
    };

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

    return (
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
            allFinancial{
              totalSales
              monthSales
              weekSales
              daySales
            }
          }
        `}
        variables={{ pageSize: pages, currentPage: cur, status:'completed' }}
      >
        {({ loading, data:{ orders, allFinancial }, refetch }) => {
          if (loading) return <Spin />;
          refetch();
          const { pagination } = orders;
          const {
            totalSales,
            monthSales,
            weekSales,
            daySales,
          } = allFinancial;

          return (
            <div className={styles.standardList}>
              <h3 style={{ marginTop: 10, marginBottom: 10 }}>财务统计:</h3>
              <Row gutter={24}>
                <Col {...topColResponsiveProps}>
                  <ChartCard
                    bordered={false}
                    title={<FormattedMessage id="app.analysis.total-sales" defaultMessage="Total Sales" />}
                    loading={loading}
                    total={totalSales/100}
                    footer={<Field />}
                    contentHeight={46}
                  />
                </Col>
                <Col {...topColResponsiveProps}>
                  <ChartCard
                    bordered={false}
                    title={<FormattedMessage id="app.analysis.monthly-sales" defaultMessage="月销售额" />}
                    loading={loading}
                    total={monthSales/100}
                    footer={<Field />}
                    contentHeight={46}
                  />
                </Col>
                <Col {...topColResponsiveProps}>
                  <ChartCard
                    bordered={false}
                    title={<FormattedMessage id="app.analysis.weekly-sales" defaultMessage="周销售额" />}
                    loading={loading}
                    total={weekSales/100}
                    footer={<Field />}
                    contentHeight={46}
                  />
                </Col>
                <Col {...topColResponsiveProps}>
                  <ChartCard
                    bordered={false}
                    title={<FormattedMessage id="app.analysis.daily-sales" defaultMessage="日销售额" />}
                    loading={loading}
                    total={daySales/100}
                    footer={<Field />}
                    contentHeight={46}
                  />
                </Col>
              </Row>
              <h3 style={{ marginTop: 10, marginBottom: 10 }}>已完成订单:</h3>
              <Card>
                <List
                  size="large"
                  rowKey="id"
                  loading={loading}
                  dataSource={orders && orders.list ? orders.list : []}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={`[${item.id}]`}
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
              </Card>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default CreateItem;
