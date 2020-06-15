import {
    Card,
    List,
    Avatar,
    Form,
    Input,
    Modal,
    message,
    Button,
    Spin,
  } from 'antd';
  import gql from 'graphql-tag';
  import React, { PureComponent } from 'react';
  // import router from 'umi/router';
  import { Query, Mutation } from 'react-apollo';
  import PageHeaderWrapper from '@/components/PageHeaderWrapper';
  // import {hashHistory} from 'react-router';
  import styles from './TopUp.less';
  import FileUploader from '@/components/fileUploader';

  const FormItem = Form.Item;
  
  const UpdateCategory = Form.create()(props => {
    const { UpdatemodalVisible, form, UpdatahandleModalVisible, formLayout, data } = props;
  
    const refreshId = data ? data.id : null;
  
    return (
      <Mutation
        mutation={gql`
          mutation($id: ID!, $price: Int, $givePoint: Int) {
            updateTopUp(input: { id: $id, price: $price, givePoint: $givePoint }) {
              id
              price
              givePoint
            }
          }
        `}
        variables={{ id: refreshId }}
      >
        {mutate => {
          const handleSubmit = e => {
            const refreshData ={};
            if (e) {
              // 这里的e不携带任何有效参数
              if (e.id) refreshData.id = e.id;
              if (e.price) refreshData.price = e.price*100;
              if (e.givePoint) refreshData.givePoint = e.givePoint*100;
              try {
                const promise = new Promise(resolve => {
                  
                  resolve(mutate({ variables: refreshData }));
                });
                promise.then(value => {
                  console.log(value);
                  message.success('修改成功');
                  // refetch();
                  UpdatahandleModalVisible()
                });
              } catch (catchedError) {
                //
              }
            }
          };
          return (
            <Modal
              destroyOnClose
              title="修改充值"
              visible={UpdatemodalVisible}
              onOk={() => {
                form.validateFields((err, fieldsValue) => {
                  if (err) return;
                  handleSubmit(fieldsValue);
                });
              }}
              onCancel={() => UpdatahandleModalVisible()}
            >
              <div>
                <FormItem {...formLayout} label="ID">
                  {form.getFieldDecorator('id', {
                    initialValue: data ? data.id : null,
                    rules: [
                      {
                        require: false,
                      },
                    ],
                  })(<Input disabled />)}
                </FormItem>
                <FormItem {...formLayout} label="价格">
                  {form.getFieldDecorator('price', {
                    rules: [
                      {
                        require: false,
                        message: '请填写价格',
                      },
                    ],
                  })(<Input placeholder={data ? data.price/100 : '请填写新的价格'} />)}
                </FormItem>
                <FormItem {...formLayout} label="赠送的积分">
                  {form.getFieldDecorator('givePoint', {
                    rules: [
                      {
                        require: false,
                        message: '请填写赠送的积分',
                      },
                    ],
                  })(<Input placeholder={data ? data.givePoint/100 : '请填写赠送的积分'} />)}
                </FormItem>
              </div>
            </Modal>
          );
        }}
      </Mutation>
    );
  });
  
  const CreateForm = Form.create()(props => {
    const { modalVisible, form, handleModalVisible, formLayout } = props;
    return (
      <Mutation
        mutation={gql`
          mutation($id: ID, $price: Int, $givePoint: Int) {
            createTopUp(input: { id: $id, price: $price, givePoint: $givePoint }) {
                id
                price
                givePoint
            }
          }
        `}
      >
        {mutate => {
          const handleSubmit = e => {
            const refreshData ={};
            if (e) {
              // 这里的e不携带任何有效参数
              console.log('e',e);
              if (e.id) refreshData.id = e.id;
              if (e.price) refreshData.price = e.price*100;
              if (e.givePoint) refreshData.givePoint = e.givePoint*100;
              try {
                const promise = new Promise(resolve => {
                  resolve(mutate({ variables: refreshData }));
                });
                promise.then(value => {
                  console.log(value);
                  message.success('新建成功');
                  handleModalVisible();
                });
              } catch (catchedError) {
                //
              }
            }
          };
          return (
            <Modal
              destroyOnClose
              title="创建充值"
              visible={modalVisible}
              onOk={() => {
                form.validateFields((err, fieldsValue) => {
                  if (err) return;
                  handleSubmit(fieldsValue);
                });
              }}
              onCancel={() => handleModalVisible()}
            >
              <div>
                <FormItem {...formLayout} label="价格">
                  {form.getFieldDecorator('price', {
                    rules: [
                      {
                        require: true,
                        message: '请填写价格',
                      },
                    ],
                  })(<Input placeholder="请填写价格" />)}
                </FormItem>
                <FormItem {...formLayout} label="赠送的积分">
                  {form.getFieldDecorator('givePoint', {
                    rules: [
                      {
                        require: true,
                        message: '请填写赠送的积分',
                      },
                    ],
                  })(<Input placeholder="请填写赠送的积分" />)}
                </FormItem>
              </div>
            </Modal>
          );
        }}
      </Mutation>
    );
  });
  
  class TopUp extends PureComponent {
    state = {};
  
    handleModalVisible = flag => {
      this.setState({
        modalVisible: !!flag,
      });
    };
  
    UpdatahandleModalVisible = flag => {
      this.setState({
        UpdatemodalVisible: !!flag,
      });
    };
  
    Getlist = e => {
      this.setState({
        getlistitem: e,
      });
    };
  
    render() {
      const { modalVisible, UpdatemodalVisible, deleteId, getlistitem } = this.state;
  
      const formLayout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 13 },
      };
  
      const parentMethods = {
        handleModalVisible: this.handleModalVisible,
      };
  
      const UpdataparentMethods = {
        UpdatahandleModalVisible: this.UpdatahandleModalVisible,
      };
  
      return (
        <PageHeaderWrapper title="用户充值">
          <Card bordered={false}>
            <Query
              query={gql`
                {
                topUpList {
                    id
                    price
                    givePoint
                  }
                }
              `}
            >
              {({ loading, data: { topUpList }, refetch }) => {
                if (loading) return <Spin />;
                refetch();
                console.log('topUpList',topUpList);
  
                const editAndDelete = e => {
                  const id = e;
                  this.setState({
                    deleteId: id,
                  });
                };
  
                return (
                  <Mutation
                    mutation={gql`
                      mutation($id: ID!) {
                        deleteTopUp(id: $id)
                      }
                    `}
                    variables={{ id: deleteId }}
                  >
                    {mutate => {
                      const itemid = {};
                      const deleteCategory = e => {
                        if (e) {
                          itemid.id = e;
                          try {
                            const promise = new Promise(resolve => {
                                
                                console.log("id",itemid)
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
                            onClick={e => {
                              e.preventDefault();
                              this.handleModalVisible(true);
                            }}
                          >
                            添加
                          </Button>
                          <List
                            size="large"
                            rowKey="id"
                            loading={loading}
                            dataSource={topUpList && topUpList ? topUpList : []}
                            renderItem={item => (
                              <List.Item
                                actions={[
                                  <a
                                    onClick={() => {
                                      this.UpdatahandleModalVisible(true);
                                      this.Getlist(item);
                                    }}
                                  >
                                    修改
                                  </a>,
                                  <a
                                    onClick={() => {
                                      editAndDelete(item.id);
                                      Modal.confirm({
                                        title: '删除充值',
                                        content: '确定删除充值吗？',
                                        okText: '确认',
                                        cancelText: '取消',
                                        onOk: () => deleteCategory(item.id),
                                      });
                                    }}
                                  >
                                    删除
                                  </a>,
                                ]}
                              >
                                <List.Item.Meta
                                // 原始代码
                                  // title={`[${item.id}][${item.price/100}][${item.givePoint/100}]`}
                                  title={
                                    <div className={styles.topUp}>
                                      <div className={styles.container}>
                                        <p className={styles.title}>满</p>
                                        <p className={styles.price}>
                                          {item.price/100}
                                        </p>
                                        <p className={styles.title}>元</p>
                                      </div>
                                      <div className={styles.container}>
                                        <p className={styles.title}>赠送</p>
                                        <p className={styles.givePoint}>
                                          {item.givePoint/100}
                                        </p>
                                        <p className={styles.title}>积分</p>
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                          <CreateForm
                            {...parentMethods}
                            modalVisible={modalVisible}
                            formLayout={formLayout}
                            refetch={refetch}
                          />
                          <UpdateCategory
                            {...UpdataparentMethods}
                            data={getlistitem}
                            UpdatemodalVisible={UpdatemodalVisible}
                            formLayout={formLayout}
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
  
  export default TopUp;
  