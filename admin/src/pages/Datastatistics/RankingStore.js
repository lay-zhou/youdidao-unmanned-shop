import React, { memo } from 'react';
import { Table, Card, Spin } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styles from './Analysis.less';

const columns = [
  {
    title: <FormattedMessage id="app.analysis.table.id" defaultMessage="Rank" />,
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: <FormattedMessage id="app.analysis.table.store" defaultMessage="Search keyword" />,
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: <FormattedMessage id="app.analysis.table.store-sales" defaultMessage="Users" />,
    dataIndex: 'sales',
    key: 'sales',
    sorter: (a, b) => a.sales - b.sales,
    className: styles.alignRight,
    render: text => text / 100,
  },
];

const RankingStore = memo(({ dropdownGroup }) => (
  <Query
    query={gql`
      query($pageSize: Int, $currentPage: Int, $status: Status) {
        stores(pageSize: $pageSize, currentPage: $currentPage, status: $status) {
          list {
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
          pagination {
            pageSize
            total
            current
          }
        }
      }
    `}
    variables={{ pageSize: 5, currentPage: 1, status: 'published' }}
  >
    {({ loading, data: { stores }, refetch }) => {
      if (loading) return <Spin />;
      // console.log('query stores', stores);
      refetch();
      return (
        <Card
          loading={loading}
          bordered={false}
          title={
            <FormattedMessage id="app.analysis.ranking-store" defaultMessage="Online Top Search" />
          }
          extra={dropdownGroup}
          style={{ marginTop: 24 }}
        >
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={stores.list}
            pagination={false}
          />
        </Card>
      );
    }}
  </Query>
));

export default RankingStore;
