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
import styles from './index.less';
import FileUploader from '@/components/fileUploader';

const FormItem = Form.Item;

const UpdateCategory = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, formLayout, data } = props;

  const refreshId = data ? data.id : null;

  return (
    <Mutation
      mutation={gql`
        mutation($id: ID!, $title: String, $imageKey: String) {
          updateClassify(input: { id: $id, title: $title, imageKey: $imageKey }) {
            id
            title
            imageUrl
          }
        }
      `}
      variables={{ id: refreshId }}
    >
      {mutate => {
        const handleSubmit = e => {
          const refreshdata ={};
          if (e) {
            // 这里的e不携带任何有效参数
            if (e.id) refreshdata.id = e.id;
            if (e.title) refreshdata.title = e.title;
            if (e.imageKey) refreshdata.imageKey = e.imageKey;
            try {
              const promise = new Promise(resolve => {
                // console.log('refreshdata',refreshdata);
                
                resolve(mutate({ variables: refreshdata }));
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
            title="修改商品类型"
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
              <FormItem {...formLayout} label="类型名称">
                {form.getFieldDecorator('title', {
                  rules: [
                    {
                      require: false,
                      message: '请填写类型名称',
                    },
                  ],
                })(<Input placeholder={data ? data.title : '请填写新的类型名称'} />)}
              </FormItem>
              <FormItem {...formLayout} label="类型图片">
                {form.getFieldDecorator('imageKey', {
                  rules: [
                    {
                      require: false,
                    },
                  ],
                })(<FileUploader />)}
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
        mutation($title: String!, $imageKey: String!) {
          createClassify(input: { title: $title, imageKey: $imageKey }) {
            id
            title
            imageUrl
          }
        }
      `}
    >
      {mutate => {
        const handleSubmit = e => {
          if (e) {
            // 这里的e不携带任何有效参数
            try {
              const promise = new Promise(resolve => {
                resolve(mutate({ variables: e }));
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
            title="新增商品分类"
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
              <FormItem {...formLayout} label="商品分类名称">
                {form.getFieldDecorator('title', {
                  rules: [
                    {
                      require: true,
                      message: '请填写商品分类名称',
                    },
                  ],
                })(<Input placeholder="请填写商品分类名称" />)}
              </FormItem>
              <FormItem {...formLayout} label="商品分类图片">
                {form.getFieldDecorator('imageKey', {
                  rules: [
                    {
                      require: true,
                      message: '请上传商品分类图片',
                    },
                  ],
                })(<FileUploader />)}
              </FormItem>
            </div>
          </Modal>
        );
      }}
    </Mutation>
  );
});

class ItemCategory extends PureComponent {
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
      <PageHeaderWrapper title="商品分类">
        <Card bordered={false}>
          <Query
            query={gql`
              {
                classify {
                  id
                  title
                  imageUrl
                }
              }
            `}
          >
            {({ loading, data: { classify }, refetch }) => {
              if (loading) return <Spin />;
              refetch();
              // console.log('classify', classify);

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
                      deleteClassify(id: $id)
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
                        {classify.length < 10 ? (
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
                        ) : null}
                        <List
                          size="large"
                          rowKey="id"
                          loading={loading}
                          dataSource={classify && classify ? classify : []}
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
                                      title: '删除商品类型',
                                      content: '确定删除该类型吗？',
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
                                avatar={<Avatar src={item.imageUrl} shape="square" size="large" />}
                                title={`${item.title}`}
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

export default ItemCategory;
