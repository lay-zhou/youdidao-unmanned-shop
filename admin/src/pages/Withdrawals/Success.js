import { Card, Spin, Input, List, Pagination } from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const { Search } = Input;

class StoreInfo extends PureComponent {

    state = {
        pages:10,
        cur:1,
      };

  render() {

    const { pages, cur } = this.state;


    const Changepage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const extraContent = (
      <div>
        <Search
          placeholder="请输入"
          onSearch={value => this.handleSearch(value)}
        />
      </div>
    );

    const ListContent = ({ data: { name, price, store, phone, account, card, remark} }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>姓名</p>
          <p>{name || 'null'}</p>
        </div>
        {
          store?
            <div className={styles.listContentItem}>
              <p>商店名称</p>
              <p>{store.name}</p>
            </div>
            :null
        }
        <div className={styles.listContentItem}>
          <p>提现金额</p>
          <p>{price/100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>号码</p>
          <p>{phone}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>提现卡号</p>
          <p>{card}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>提现账户</p>
          <p>{account}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>备注</p>
          <p>{remark}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>提现状态:</p>
          <p>已打卡</p>
        </div>
      </div>
    );

    return (
      <PageHeaderWrapper>
        <Card bordered={false} title="待处理提现" extra={extraContent}>
          <Query
            query={gql`
                query(
                  $userId: ID, 
                  $status:WithdrawalType, 
                  $pageSize: Int, 
                  $currentPage:Int,
                  $type: WithType,
                  )
                {
                    withdrawals(
                        userId: $userId,
                        status: $status,
                        pageSize: $pageSize,
                        currentPage: $currentPage,
                        type: $type,
                    ){
                      list{
                        id
                        name
                        price
                        phone
                        account
                        card
                        remark
                        createdAt
                        updatedAt
                        status
                        type
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
                          name
                          distance
                          sales
                          balance
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
            variables={{ status: 'success', pageSize: pages, currentPage: cur, type: 'store' }}
          >
            {({ loading, data: { withdrawals },refetch }) => {
                console.log('Query return withdrawals', withdrawals);
                if (loading) return <Spin />;
                refetch();
                const { pagination } = withdrawals;
                
                return (
                  <div className={styles.standardList}>
                    <List
                      size="large"
                      rowKey="id"
                      loading={loading}
                      dataSource={withdrawals && withdrawals.list ? withdrawals.list : []}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta description={`ID: ${item.id}`} />
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
                );
            }}
          </Query>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default StoreInfo;
