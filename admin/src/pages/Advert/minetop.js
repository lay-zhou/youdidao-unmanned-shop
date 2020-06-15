import React, { PureComponent } from 'react';
import { Card, message, List, Form, Input, Modal, Spin, Button, Icon } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import ImagesUploader from '@/components/ImagesUploader';
import styles from './index.less';

const FormItem = Form.Item;

const UpdateCategory = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, refetch, formLayout, data } = props;

  const refreshId = data ? data.id : null;

  return (
    <Mutation
      mutation={gql`
        mutation($id: ID, $title: String, $fileKey: String, $position: String) {
          updateBanner(input: { id: $id, title: $title, fileKey: $fileKey, position: $position }) {
            id
            title
            position
            imageUrl
          }
        }
      `}
      variables={{ id: refreshId }}
    >
      {mutate => {
        const handleSubmit = e => {
          const updatadata = {};
          if (e) {
            updatadata.id = e.id;
            if (e.title) updatadata.title = e.title;
            if (e.fileKey) updatadata.fileKey = String(e.fileKey);
            if (updatadata.title || updatadata.fileKey) {
              try {
                const promise = new Promise(resolve => {
                  resolve(mutate({ variables: updatadata }));
                });
                promise.then(value => {
                  console.log(value);
                  message.success('修改成功');
                  UpdatahandleModalVisible();
                  refetch();
                });
              } catch (catchedError) {
                //
              }
            } else {
              message.error('请上传新的图片或标题');
            }
          }
        };
        return (
          <Modal
            destroyOnClose
            title="修改图片"
            visible={UpdatemodalVisible}
            onOk={() => {
              form.validateFields((err, fieldsValue) => {
                console.log('form.validateFields', fieldsValue);
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
                      required: false,
                    },
                  ],
                })(<Input disabled />)}
              </FormItem>
              <FormItem {...formLayout} label="图片名称">
                {form.getFieldDecorator('title', {
                  rules: [
                    {
                      require: false,
                      message: '请填写图片名称',
                    },
                  ],
                })(<Input placeholder={data ? data.title : '请填写新的图片名称'} />)}
              </FormItem>
              <FormItem {...formLayout} label="类型图片">
                {form.getFieldDecorator('fileKey', {
                  rules: [
                    {
                      required: false,
                      message: '请上传类型图片',
                    },
                  ],
                })(<ImagesUploader num={1} />)}
              </FormItem>
            </div>
          </Modal>
        );
      }}
    </Mutation>
  );
});

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleModalVisible, refetch, formLayout } = props;
  return (
    <Mutation
      mutation={gql`
        mutation($id: ID, $title: String, $fileKey: String, $position: String) {
          addBanner(input: { id: $id, title: $title, fileKey: $fileKey, position: $position }) {
            id
            title
            position
            imageUrl
          }
        }
      `}
    >
      {mutate => {
        const handleSubmit = e => {
          const adddata = {};
          if (e) {
            adddata.position = 'mineTop';
            if (e.title) {
              adddata.title = e.title;
            } else {
              message.error('请输入广告标题');
              return;
            }
            if (e.fileKey) {
              adddata.fileKey = String(e.fileKey);
            } else {
              message.error('请上传图片');
              return;
            }
            try {
              const promise = new Promise(resolve => {
                resolve(mutate({ variables: adddata }));
              });
              promise.then(value => {
                console.log(value);
                message.success('新建成功');
                handleModalVisible();
                refetch();
              });
            } catch (catchedError) {
              //
            }
          }
        };
        return (
          <Modal
            destroyOnClose
            title="新增图片"
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
              <FormItem {...formLayout} label="标题">
                {form.getFieldDecorator('title', {
                  rules: [
                    {
                      required: false,
                      message: '请填写图片标题',
                    },
                  ],
                })(<Input placeholder="请输入图片标题" />)}
              </FormItem>
              <FormItem {...formLayout} label="图片">
                {form.getFieldDecorator('fileKey', {
                  rules: [
                    {
                      required: false,
                      message: '请上传广告图片',
                    },
                  ],
                })(<ImagesUploader num={1} />)}
              </FormItem>
            </div>
          </Modal>
        );
      }}
    </Mutation>
  );
});

class CardList extends PureComponent {
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
      <Query
        query={gql`
          query {
            banners(position: "mineTop") {
              id
              title
              position
              imageUrl
            }
          }
        `}
      >
        {({ loading, data, refetch }) => {
          if (loading) return <Spin />;

          const { banners } = data;

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
                  deleteBanner(id: $id)
                }
              `}
              variables={{ id: deleteId }}
            >
              {mutate => {
                const deleteBan = e => {
                  if (e) {
                    try {
                      const promise = new Promise(resolve => {
                        resolve(mutate({ variables: e }));
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
                  <PageHeaderWrapper title="我的上部广告">
                    <div className={styles.cardList}>
                      {banners.length < 3 ? (
                        <Button
                          type="primary"
                          style={{ marginBottom: 8, position: 'absolute', top: 122, right: 25 }}
                          onClick={e => {
                            e.preventDefault();
                            this.handleModalVisible(true);
                          }}
                        >
                          <Icon type="plus" /> 新建图片
                        </Button>
                      ) : null}

                      <List
                        rowKey="id"
                        loading={loading}
                        grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
                        dataSource={banners}
                        renderItem={item => (
                          <div>
                            <List.Item key={item.id}>
                              <Card
                                hoverable
                                className={styles.card}
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
                                        title: '删除图片',
                                        content: '确定删除该图片吗？',
                                        okText: '确认',
                                        cancelText: '取消',
                                        onOk: () => deleteBan(item.id),
                                      });
                                    }}
                                  >
                                    删除
                                  </a>,
                                ]}
                              >
                                <Card.Meta
                                  avatar={
                                    <img alt="" className={styles.cardAvatar} src={item.imageUrl} />
                                  }
                                />
                              </Card>
                            </List.Item>
                          </div>
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
                  </PageHeaderWrapper>
                );
              }}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default CardList;
