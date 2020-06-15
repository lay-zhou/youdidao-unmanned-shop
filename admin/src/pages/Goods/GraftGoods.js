import {
  Card,
  Form,
  Spin,
  List,
  Modal,
  message,
  Avatar,
  Pagination,
  Button,
  Input,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './index.less';

const { Search } = Input;

const UpdateCategory = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, data } = props;
  
  const updateId = data ? data.code : null;

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
      variables={{ code: updateId, status:'published' }}
    >
      {mutate => {
        const handleSubmit = () => {
          const adddata = {};
          adddata.code = updateId;
          adddata.status = 'published';
          try {
            const promise = new Promise(resolve => {
              console.log('adddata', adddata);
              resolve(mutate({ variables: adddata }));
            });
            promise.then(value => {
              console.log(value);
              message.success('上架成功');
              UpdatahandleModalVisible();
            });
          } catch (catchedError) {
            //
          }
        };
        return (
          <Modal
            destroyOnClose
            title="上架"
            visible={UpdatemodalVisible}
            onOk={() => {
              form.validateFields((err, fieldsValue) => {
                if (err) return;
                handleSubmit(fieldsValue);
              });
            }}
            onCancel={() => UpdatahandleModalVisible()}
          >
            <p>是否上架，确认上架请确定</p>
          </Modal>
        );
      }}
    </Mutation>
  );
});

class CreateItem extends PureComponent {
  state = {
    pages:10,
    cur:1,
    searchhName:'',
  };

  UpdatahandleModalVisible = flag => {
    this.setState({
      UpdatemodalVisible: !!flag,
    });
  };

  getList = e => {
    this.setState({
      getListItem: e,
    });
  };

  handleAdd = () => {
    this.handleModalVisible();
  };

  handleSearch = e => {
    this.setState({
      searchhName: e,
    });
  };

  render() {
    const { UpdatemodalVisible, cur, pages, deleteId, getListItem, searchhName } = this.state;

    const UpdataparentMethods = {
      UpdatahandleModalVisible: this.UpdatahandleModalVisible,
    };
    
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

    const changePage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const jump = () => {
      router.push(`/Goods/GraftGoods/AddGood`);
    }

    const jump1 = goodId => {
      router.push(`/Goods/GraftGoods/ModifyGood/${goodId}`);
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
            variables={{ pageSize: pages, currentPage: cur, status: 'draft', nameLike: searchhName }}
          >
            {({ loading, data, refetch }) => {
              if (loading) return <Spin />;
              refetch();
              const { items } = data;
              console.log('items',items);
              const { pagination } = items;

              const editAndDelete = e => {
                const code= e;
                this.setState({
                  deleteId: code,
                });
              };

              return (
                <Mutation
                  mutation={gql`
                    mutation($code: ID!) {
                      deleteItem(code: $code)
                    }
                  `}
                  variables={{ code: deleteId }}
                >
                  {mutate => {
                    const itemid = {};
                    const deleteItem = e => {
                      if (e) {
                        itemid.code = e;
                        try {
                          const promise = new Promise(resolve => {
                            resolve(mutate({ variables: itemid }));
                          });
                          promise.then(value => {
                            console.log(value);
                            message.success('删除成功');
                            refetch();
                          });
                        } catch (catchedError) {
                          //
                        }
                      }
                    };

                    return (
                      <div className={styles.standardList}>
                        <Button
                          type="dashed"
                          style={{ width: '100%', marginBottom: 8 }}
                          icon="plus"
                          onClick={()=> jump()}
                        >
                          添加
                        </Button>
                        <List
                          size="large"
                          rowKey="code"
                          loading={loading}
                          dataSource={items && items.list ? items.list : []}
                          renderItem={item => (
                            <List.Item
                              actions={[
                                <a
                                  onClick={() => jump1(item.code)}
                                >
                                  修改
                                </a>,
                                <a
                                  onClick={() => {
                                    this.UpdatahandleModalVisible(true);
                                    this.getList(item);
                                  }}
                                >
                                  上架
                                </a>,
                                <a
                                  onClick={() => {
                                    editAndDelete(item.code);
                                    Modal.confirm({
                                      title: '删除商品',
                                      content: '确定删除该商品吗？',
                                      okText: '确认',
                                      cancelText: '取消',
                                      onOk: () => deleteItem(item.code),
                                    });
                                  }}
                                >
                                  删除
                                </a>,
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Avatar src={item.imageUrl} shape="square" size="large" />
                                }
                                title={`${item.name}`}
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
                          onChange={changePage}
                        />
                        <UpdateCategory
                          {...UpdataparentMethods}
                          data={getListItem}
                          UpdatemodalVisible={UpdatemodalVisible}
                          refetch={refetch}
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
