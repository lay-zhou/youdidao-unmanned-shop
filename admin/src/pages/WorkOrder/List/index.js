import { Card, Table } from 'antd';
import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';
import Link from 'umi/link';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './index.less';

export default () => (
  <Query
    fetchPolicy="no-cache"
    query={gql`
      {
        list: workOrders {
          id
          title
        }
      }
    `}
  >
    {({ loading, data }) => {
      const columns = [
        {
          title: '标题',
          dataIndex: 'title',
        },
        {
          title: '操作',
          dataIndex: 'id',
          render: text => (
            <span>
              <Link to={`/work-orders/${text}`}>查看</Link>
            </span>
          ),
        },
      ];

      return (
        <PageHeaderWrapper title="工单管理">
          <Card bordered={false}>
            <div className={styles.tableList}>
              <Table
                columns={columns}
                dataSource={data && data.list ? data.list : []}
                loading={loading}
                rowKey="id"
              />
            </div>
          </Card>
        </PageHeaderWrapper>
      );
    }}
  </Query>
);
