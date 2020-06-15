import {
  Card,
  Spin,
  List,
  Modal,
  message,
  Avatar,
  Pagination,
  Input,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './index.less';

const { Search } = Input;

class CreateItem extends PureComponent {
  state = {
    pages:10,
    cur:1,
    searchhName: '',
  };

  handleSearch = e => {
    this.setState({
      searchhName: e,
    });
  };

  render() {
    const { cur, pages, searchhName } = this.state;

    const ListContent = ({ data: { pointDiscountPrice, name, originalPrice, price, type, status } }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>名称</p>
          <p>{name}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>原价</p>
          <p>{Number(originalPrice) / 100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>价格</p>
          <p>{Number(price) / 100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>最大抵扣金额</p>
          <p>{Number(pointDiscountPrice) / 100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>类型</p>
          <p>{type === 'special' ? '不可退款' : '可退款'}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>状态</p>
          <p>{status === 'published' ? '已上架' : '未上架'}</p>
        </div>
      </div>
    );

    const Changepage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const jump = itemId => {
      router.push(`/Goods/GoodsList/GoodDetail/${itemId}`);
    }

    const extraContent = (
      <div>
        <Search
          placeholder="请输入"
          onSearch={value => this.handleSearch(value)}
        />
      </div>
    ); 

    return (
      <PageHeaderWrapper>
        <Card bordered={false} title="商品列表" extra={extraContent}>
          <Query
            query={gql`
              query(
                $pageSize: Int,
                $currentPage: Int,
                $status: Status,
                $nameLike: String,
              ){
                items(
                  pageSize: $pageSize,
                  currentPage: $currentPage,
                  status: $status,
                  nameLike: $nameLike,
                ) {
                  list {
                    code
                    name
                    content
                    originalPrice
                    pointDiscountPrice
                    price
                    unit
                    imageUrl
                    stock
                    type
                    status
                  }
                  pagination{
                    pageSize
                    total
                    current
                  }
                }
              }
            `}
            variables={{ pageSize: pages, currentPage: cur, status: 'published', nameLike: searchhName }}
          >
            {({ loading, data, refetch }) => {
              if (loading) return <Spin />;
              refetch();
              const { items } = data;
              console.log('items',items);
              const { pagination } = items;
              return (
                <Mutation
                  mutation={gql`
                    mutation(
                      $code: ID!
                      $status: ItemStatus
                    ) {
                      updateItemStatus(
                        input: {
                          # 名称
                          code: $code
                          # 简介
                          status: $status
                        }
                      ) 
                    }
                  `}
                >
                  {mutate => {
                    const updateStatus = dataId => {
                      const itemData = {};
                      itemData.code = dataId;
                        itemData.status = 'draft';
                        try {
                          const promise = new Promise(resolve => {
                            console.log('itemData', itemData);
                            resolve(mutate({ variables: itemData }));
                          });
                          promise.then(value => {
                            console.log(value);
                            message.success('下架成功');
                            refetch();
                          });
                        } catch (catchedError) {
                          //
                        }
                    };

                    return (
                      <div className={styles.standardList}>
                        <List
                          size="large"
                          rowKey="code"
                          loading={loading}
                          dataSource={items && items.list ? items.list : []}
                          renderItem={item => (
                            <List.Item
                              actions={[
                                <a
                                  onClick={() => {
                                    Modal.confirm({
                                      title: '下架商品',
                                      content: '确定下架该类型吗？',
                                      okText: '确认',
                                      cancelText: '取消',
                                      onOk: () => updateStatus(item.code),
                                    });
                                  }}
                                >
                                  下架
                                </a>,
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Avatar src={item.imageUrl} shape="square" size="large" />
                                }
                                title={<a onClick={()=>jump(item.code)}>{item.name}</a>}
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
                    );
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
