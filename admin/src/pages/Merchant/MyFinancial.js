import {
  Spin,
  // Pagination,
  Row, 
  Col,
  Table,
  Card,
  Button,
} from 'antd';
import gql from 'graphql-tag';
import { ChartCard, Field } from '@/components/Charts';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
import moment from 'moment';
import router from 'umi/router';
import styles from './index.less';

const ButtonGroup = Button.Group;

class CreateItem extends PureComponent {
  state = {
    myTime: 'today',
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: text => <a onClick={()=>this.jump(text)}>{text}</a>,
    },
    {
      title: '订单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => {
        return <span>{moment(String(text)).format('YYYY-MM-DD')}</span>;
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (text) => {
        return <span>{text/100}</span>;
      },
    },
    {
      title: '抵扣价格',
      dataIndex: 'discount',
      key: 'discount',
      render: (text) => {
        return <span>{text/100}</span>;
      },
    },
    {
      title: '总计',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => {
        return <span>{text/100}</span>;
      },
    },
    {
      title: '配送时间',
      dataIndex: 'time',
      key: 'time',
      // render: (text) => {
      //   return <span>{text/100}</span>;
      // },
    },
  ];
  
  jump = (text) => {
    router.push(`/MyFinancial/OrderDetails/${text}`);
  }

  render() {
    const { myTime } = this.state;
    const changeTime = (time) => {
      this.setState({
          myTime: time
      })
  }

  const topColResponsiveProps = {
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 12,
    style: { marginBottom: 24 },
  };

    // const Changepage = (page, pageSize) => {
    //   this.setState({
    //     cur: page,
    //     pages: pageSize,
    //   })
    // }

    // const jump = (orderId) => {
    //   router.push(`/OrderList/TakeGoods/TakeOrderDetail/${orderId}`);
    // }

    return (
      <Query
        query={gql`
          query($time: MerchantOrderType){
            merchantOrder(time: $time){
            totalMerchantSales
            merchantSales
            timeOrder{
              id
              price
              discount
              amount
              createdAt
              time
            }
          }
          }
        `}
        variables={{ time: myTime }}
      >
        {({ loading, data:{ merchantOrder }, refetch }) => {
          if (loading) return <Spin />;
          refetch();

          const { 
            totalMerchantSales,
            merchantSales,
            timeOrder ,
          } = merchantOrder;

          const extraContent = (
            <div>
              <ButtonGroup>
                {
                  myTime === 'today'?
                    <Button type="primary" onClick={()=> changeTime('today')}>今日</Button>
                  :
                    <Button onClick={()=> changeTime('today')}>今日</Button>
                }
                {
                  myTime === 'week'?
                    <Button type="primary" onClick={()=> changeTime('week')}>本周</Button>
                  :
                    <Button onClick={()=> changeTime('week')}>本周</Button>
                }
                {
                  myTime === 'month'?
                    <Button type="primary" onClick={()=> changeTime('month')}>本月</Button>
                  :
                    <Button onClick={()=> changeTime('month')}>本月</Button>
                }
                {
                  myTime === 'year'?
                    <Button type="primary" onClick={()=> changeTime('year')}>本年</Button>
                  :
                    <Button onClick={()=> changeTime('year')}>本年</Button>
                }
              </ButtonGroup>
              {/* <Button
                style={{ marginLeft: 5, }}
                onClick={() => this.downloadExcel(allOrder)}
              >
                <Icon type="plus" /> 导出报表
              </Button> */}
            </div>
          );

          return (
            <Card bordered={false} title="订单统计" extra={extraContent}>
              <div className={styles.standardList}>
                <Row gutter={24}>
                  <Col {...topColResponsiveProps}>
                    <ChartCard
                      bordered={false}
                      title='总销售额'
                      loading={loading}
                      total={totalMerchantSales/100}
                      footer={<Field />}
                      contentHeight={46}
                    />
                  </Col>
                  <Col {...topColResponsiveProps}>
                    <ChartCard
                      bordered={false}
                      title='销售额'
                      loading={loading}
                      total={merchantSales/100}
                      footer={<Field />}
                      contentHeight={46}
                    />
                  </Col>
                </Row>
                <Table
                  rowKey={timeOrder.id}
                  loading={loading}
                  columns={this.columns}
                  dataSource={timeOrder}
                />
                
                
                {/* <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  style={{ float:"right" }}
                  onChange={Changepage}
                /> */}
              </div>
            </Card>
          );
        }}
      </Query>
    );
  }
}

export default CreateItem;
