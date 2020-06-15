import React, { memo } from 'react';
import { Table, Card, Spin } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styles from './Analysis.less';

const columns = [
  {
    title: <FormattedMessage id="app.analysis.table.id" defaultMessage="Rank" />,
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: <FormattedMessage id="app.analysis.table.product" defaultMessage="Search keyword" />,
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: <FormattedMessage id="app.analysis.table.product-stock" defaultMessage="Users" />,
    dataIndex: 'stock',
    key: 'stock',
    sorter: (a, b) => a.stock - b.stock,
    className: styles.alignRight,
    render: text => text,
  },
];

const RankingGoods = memo(({ dropdownGroup }) => (
  <Query
    query={gql`
      query($pageSize: Int, $currentPage: Int, $itemClassId:ID,$status:Status, $projectId:ID, $nameLike:String,$type :String,$stateless: Boolean){
        items(pageSize: $pageSize, currentPage: $currentPage, itemClassId: $itemClassId, status: $status, projectId: $projectId, nameLike: $nameLike, type: $type , stateless: $stateless){
          list{
              code
              name
              imageUrl
              content
              originalPrice
              commission
              price
              unit
              stock
              type
              kind
              status
                followed
              }
            pagination {
              pageSize
              total
              current
            }
  }
}
    `}
    variables={{ pageSize: 5, currentPage: 1 }}
  >
    {({ loading, data: { items }, refetch }) => {
      if (loading) return <Spin />;
      // console.log('query items', items);
      refetch();
      return (
        <Card
          loading={loading}
          bordered={false}
          title={
            <FormattedMessage id="app.analysis.ranking-goods" defaultMessage="Online Top Search" />
          }
          extra={dropdownGroup}
          style={{ marginTop: 24 }}
        >
          <Table
            rowKey="code"
            size="small"
            columns={columns}
            dataSource={items.list}
            pagination={false}
          />
        </Card>
      );
    }}
  </Query>
));

export default RankingGoods;
