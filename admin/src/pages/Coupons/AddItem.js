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
import styles from './Coupons.less';

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

    // 截取路由
    const urlParams = new URL(window.location.href);
    const { hash } = urlParams;
    const projectId = hash.split('AddItem/')[1];

    const ListContent = ({ data: { name, originalPrice, price, type, status } }) => (
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
                $stateless: Boolean,
              ){
                items(
                  pageSize: $pageSize,
                  currentPage: $currentPage,
                  status: $status,
                  nameLike: $nameLike,
                  stateless: $stateless,
                ) {
                  list {
                    code
                    name
                    content
                    originalPrice
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
            variables={{ pageSize: pages, currentPage: cur, status: 'published', nameLike: searchhName, stateless: true }}
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
                      $itemCode: ID!
                      $projectId: ID
                      $type: UpdateItemToProjectType
                    ) {
                      updateItemToProject(
                        input: {
                          # 商品ID
                          itemCode: $itemCode
                          # 专题ID
                          projectId: $projectId
                          # 类型
                          type: $type
                        }
                      ) 
                    }
                  `}
                >
                  {mutate => {
                    const addItem = itemCode => {
                      const itemData = {};
                        itemData.itemCode = itemCode;
                        itemData.projectId = projectId;
                        itemData.type = 'add';
                        try {
                          const promise = new Promise(resolve => {
                            console.log('itemData', itemData);
                            resolve(mutate({ variables: itemData }));
                          });
                          promise.then(value => {
                            console.log(value);
                            message.success('添加成功');
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
                                      title: '添加商品',
                                      content: '确定添加该商品吗？',
                                      okText: '确认',
                                      cancelText: '取消',
                                      onOk: () => addItem(item.code),
                                    });
                                  }}
                                >
                                  添加
                                </a>,
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Avatar src={item.imageUrl} shape="square" size="large" />
                                }
                                title={`[${item.code}]${item.name}`}
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
