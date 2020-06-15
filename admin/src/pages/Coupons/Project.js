import {
  Card,
  List,
  Button,
  Input,
  Modal,
  Form,
  Spin,
  message,
  Avatar,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './Coupons.less';
import ImageUploader from '@/components/ImagesUploader';

const FormItem = Form.Item;
const UpdateIssueCoupon = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, formLayout, data, refetch } = props;

  return (
    <Mutation
      mutation={gql`
        mutation(
          $id: ID, 
          $title: String, 
          $imageKey: String,
          ) {
            updateProject(
            input: {
              id: $id
              title: $title
              imageKey: $imageKey
            }
          ) {
            id
            title
            imageUrl
          }
        }
      `}
    >
      {mutate => {
        const handleSubmit = e => {
          const updateData ={};
          if (e) {
            updateData.id = data.id;
            if (e.title) updateData.title = String(e.title);
            if (e.imageKey) updateData.imageKey = String(e.imageKey);
            try {
              const promise = new Promise(resolve => {
                // console.log('updateData',updateData);
                
                resolve(mutate({ variables: updateData }));
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
          }
        };
        return (
          <Modal
            destroyOnClose
            title="修改专题"
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
                  rules: [
                    {
                      require: false,
                      message: '请填写优惠券ID',
                    },
                  ],
                })(<Input disabled placeholder={data ? data.id : '请输入新的ID'} />)}
              </FormItem>
              <FormItem {...formLayout} label="专题标题">
                {form.getFieldDecorator('title', {
                  rules: [
                    {
                      require: false,
                      message: '请填写专题标题',
                    },
                  ],
                })(<Input placeholder={data ? data.title : '请输入新的专题标题'} />)}
              </FormItem>
              <FormItem {...formLayout} label="专题图片">
                {form.getFieldDecorator('imageKey', {
                  rules: [
                    {
                      required: false,
                      message: '请上传专题图片',
                    },
                  ],
                })(<ImageUploader num={1} />)}
              </FormItem>
            </div>
          </Modal>
        );
      }}
    </Mutation>
  );
});

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleModalVisible, formLayout, refetch } = props;
  return (
    <Mutation
      mutation={gql`
        mutation(
          $id: ID,
          $title: String,
          $imageKey: String,
          ) {
            createProject(
            input: {
              id: $id
              title: $title
              imageKey: $imageKey
            }
          ) {
            id
          }
        }
      `}
    >
      {mutate => {
        const handleSubmit = e => {
          const data = {};
          if (e) {
            if (e.title) data.title = String(e.title);
            if (e.imageKey) data.imageKey = String(e.imageKey);

            try {
              const promise = new Promise(resolve => {
                // console.log('data',data);
                
                resolve(mutate({ variables: data }));
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
            title="添加专题"
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
              <FormItem {...formLayout} label="专题标题">
                {form.getFieldDecorator('title', {
                  rules: [
                    {
                      required: true,
                      message: '请填写专题标题',
                    },
                  ],
                })(<Input placeholder="请填写专题标题" />)}
              </FormItem>
              <FormItem {...formLayout} label="专题图片">
                {form.getFieldDecorator('imageKey', {
                  rules: [
                    {
                      required: true,
                      message: '请上传专题图片',
                    },
                  ],
                })(<ImageUploader num={1} />)}
              </FormItem>
            </div>
          </Modal>
        );
      }}
    </Mutation>
  );
});

class ItemList extends PureComponent {
  state = {

  };

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

    const jump = (projectsId) => {
      router.push(`/Coupons/Project/ProjectItem/${projectsId}`);
    };

    return (
      <Query
        query={gql`
          query{
            projects{
              id
              title
              imageUrl
            }
          }
        `}
      >
        {({ loading, data: { projects }, refetch }) => {
          if (loading) return <Spin />;
          refetch();
          // console.log('data projects', projects);
          const getlist = e => {
            this.setState({
              getlistitem: e,
            });
          };

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
                  deleteProject(id: $id)
                }
              `}
              variables={{ id: deleteId }}
            >
              {mutate => {
                const itemid = {};
                const deleteList = e => {
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
                  <PageHeaderWrapper>
                    <Card
                      bordered={false}
                      className={styles.listCard}
                      title="标准列表"
                      style={{ marginTop: 24 }}
                    >
                      <div className={styles.standardList}>
                        {
                          projects.length < 5 ?
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
                          :null
                        }
                        
                        <List
                          size="large"
                          rowKey="id"
                          loading={loading}
                          pagination
                          dataSource={projects}
                          renderItem={item => (
                            <List.Item
                              actions={[
                                <a
                                  onClick={e => {
                                    e.preventDefault();
                                    this.UpdatahandleModalVisible(true);
                                    getlist(item);
                                  }}
                                >
                                  修改
                                </a>,
                                <a
                                  onClick={() => jump(item.id)}
                                >
                                  查看商品
                                </a>,
                                <a
                                  onClick={() => {
                                    editAndDelete(item.id);
                                    Modal.confirm({
                                      title: '删除专题',
                                      content: '确定删除该专题吗？',
                                      okText: '确认',
                                      cancelText: '取消',
                                      onOk: () => deleteList(item.id),
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
                                title={item.id} 
                                description={item.title} 
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    </Card>
                    <CreateForm
                      {...parentMethods}
                      modalVisible={modalVisible}
                      formLayout={formLayout}
                      refetch={refetch}
                    />
                    <UpdateIssueCoupon
                      {...UpdataparentMethods}
                      data={getlistitem}
                      UpdatemodalVisible={UpdatemodalVisible}
                      formLayout={formLayout}
                      refetch={refetch}
                    />
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
export default ItemList;
