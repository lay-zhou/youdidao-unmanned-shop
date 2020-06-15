import React, { memo } from 'react';
import { Row, Col, Spin } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { ChartCard, Field } from '@/components/Charts';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const topColResponsiveProps = {
  xs: 8,
  sm: 8,
  md: 8,
  lg: 8,
  xl: 8,
  style: { marginBottom: 24 },
};

const IntroduceRow = memo(() => (
  <Query
    query={gql`
      query{
        consoleHome{
          allSales
          newSales
          users
          newUsers
          orders
          newOrders
        }
      }
    `}
  >
    {({ loading, data: { consoleHome },refetch })=>{
      if (loading) return <Spin />;
      console.log('consoleHome',consoleHome);
      refetch();

      const {
        allSales,
        newSales,
        users,
        newUsers,
        orders,
        newOrders,
      } = consoleHome;
      return(
        <div>
          <Row gutter={24}>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                title={<FormattedMessage id="app.analysis.total-sales" defaultMessage="总销售额" />}
                loading={loading}
                total={`￥${allSales/100}`}
                footer={<Field />}
                contentHeight={46}
              />
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                loading={loading}
                title={<FormattedMessage id="app.analysis.Total-new-sales" defaultMessage="新增总销售额" />}
                total={`￥${newSales/100}`}
                footer={<Field />}
                contentHeight={46}
              />
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                loading={loading}
                title={<FormattedMessage id="app.analysis.The-user" defaultMessage="用户" />}
                total={users}
                footer={<Field />}
                contentHeight={46}
              />
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                loading={loading}
                bordered={false}
                title={<FormattedMessage id="app.analysis.New-users" defaultMessage="新增用户" />}
                total={newUsers}
                footer={<Field />}
                contentHeight={46}
              />
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                title={<FormattedMessage id="app.analysis.The-order" defaultMessage="订单" />}
                loading={loading}
                total={orders}
                footer={<Field />}
                contentHeight={46}
              />
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                title={<FormattedMessage id="app.analysis.New-orders" defaultMessage="新增订单" />}
                loading={loading}
                total={newOrders}
                footer={<Field />}
                contentHeight={46}
              />
            </Col>
          </Row>
        </div>
      )
    }}
  </Query>
));

export default IntroduceRow;
