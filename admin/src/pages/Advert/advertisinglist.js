import { Card, List, Spin } from 'antd';
import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

export default () => (
  <Query
    query={gql`
      {
        banner {
          list {
            id
          }
          pagination {
            pageSize
            total
            current
          }
        }
      }
    `}
  >
    {({ loading, data: { banner } }) => {
      if (loading) return <Spin />;
      const ListContent = ({ data: { name, address, longitude, latitude, balance } }) => (
        <div className={styles.listContent}>
          <div className={styles.listContentItem}>
            <p>名称</p>
            <p>{name}</p>
          </div>
          <div className={styles.listContentItem}>
            <p>地址</p>
            <p>{address}</p>
          </div>
          <div className={styles.listContentItem}>
            <p>经度</p>
            <p>{longitude}</p>
          </div>
          <div className={styles.listContentItem}>
            <p>纬度</p>
            <p>{latitude}</p>
          </div>
          <div className={styles.listContentItem}>
            <p>营业额</p>
            <p>{balance}</p>
          </div>
        </div>
      );

      return (
        <PageHeaderWrapper>
          <div className={styles.standardList}>
            <Card
              bordered={false}
              className={styles.listCard}
              title="广告列表"
              style={{ marginTop: 24 }}
              bodyStyle={{ padding: '0 32px 40px 32px' }}
            >
              <List
                size="large"
                rowKey="id"
                loading={loading}
                dataSource={banner && banner.list ? banner.list : []}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <a
                        onClick={e => {
                          e.preventDefault();
                        }}
                      >
                        暂停服务
                      </a>,
                    ]}
                  >
                    <List.Item.Meta title="ID" description={item.id} />
                    <ListContent data={item} />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </PageHeaderWrapper>
      );
    }}
  </Query>
);
