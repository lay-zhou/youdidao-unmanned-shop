import {
  Card,
  List,
  DatePicker,
  InputNumber,
  Button,
  Input,
  Modal,
  Form,
  Spin,
  message,
  Select,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './Coupons.less';

const { Option } = Select;
const FormItem = Form.Item;
const UpdateIssueCoupon = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, formLayout, data, refetch } = props;

  return (
    <Mutation
      mutation={gql`
        mutation(
          $id: ID, 
          $amount: Int, 
          $require: Int, 
          $expiredDate: String, 
          $number: Int,
          $type: CouponType,
          $requirePoint: Int,
          ) {
          updateIssueCoupon(
            input: {
              id: $id
              amount: $amount
              require: $require
              expiredDate: $expiredDate
              number: $number
              type: $type
              requirePoint: $requirePoint
            }
          ) {
            id
            amount
            require
            expiredDate
            number
            requirePoint
            type
            status
            draw
          }
        }
      `}
    >
      {mutate => {
        const handleSubmit = e => {
          const updateData ={};
          if (e) {
            updateData.id = data.id;
            if (e.expiredDate) updateData.expiredDate = String(e.expiredDate);
            if (e.amount) updateData.amount = Number(e.amount*100);
            if (e.require) updateData.require = Number(e.require*100);
            if (e.number) updateData.number = e.number;
            // if (e.requirePoint) data.requirePoint = e.requirePoint;
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
            title="修改优惠券"
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
              <FormItem {...formLayout} label="优惠价格">
                {form.getFieldDecorator('amount', {
                  rules: [
                    {
                      require: false,
                      message: '请填写优惠价格',
                    },
                  ],
                })(<Input placeholder={data ? data.amount/100 : '请输入新的优惠价格'} />)}
              </FormItem>
              <FormItem {...formLayout} label="要求（满减）">
                {form.getFieldDecorator('require', {
                  rules: [
                    {
                      require: false,
                      message: '请填写需求价格',
                    },
                  ],
                })(<Input placeholder={data ? data.require/100 : '请输入新的需求价格'} />)}
              </FormItem>
              <FormItem {...formLayout} label="团购过期时间">
                {form.getFieldDecorator('expiredDate', {
                  rules: [
                    {
                      required: false,
                    },
                  ],
                })(
                  <DatePicker
                    showTime
                    placeholder="请选择"
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
              <FormItem {...formLayout} label="数量">
                {form.getFieldDecorator('number', {
                  rules: [
                    {
                      required: false,
                      message: '请输入数量！',
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={9999}
                    step={1}
                    placeholder={data ? data.number : '请输入新的数量'}
                  />
                )}
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
          $amount: Int, 
          $require: Int, 
          $expiredDate: String, 
          $number: Int,
          $type: CouponType, 
          $requirePoint: Int,
          ) {
            createIssueCoupon(
            input: {
              id: $id
              amount: $amount
              require: $require
              expiredDate: $expiredDate
              number: $number
              type: $type
              requirePoint: $requirePoint
            }
          ) {
            id
            amount
            require
            expiredDate
            number
            requirePoint
            type
            status
            draw
          }
        }
      `}
    >
      {mutate => {
        const handleSubmit = e => {
          const data = {};
          if (e) {
            // 这里的e不携带任何有效参数
            if (e.expiredDate) data.expiredDate = String(e.expiredDate);
            if (e.amount) data.amount = Number(e.amount*100);
            if (e.require) data.require = Number(e.require*100);
            if (e.number) data.number = e.number;
            if (e.type) data.type = e.type;
            if (e.requirePoint) data.requirePoint = e.requirePoint;

            try {
              const promise = new Promise(resolve => {
                console.log('data',data);
                
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
            title="添加优惠券"
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
              <FormItem {...formLayout} label="优惠价格">
                {form.getFieldDecorator('amount', {
                  rules: [
                    {
                      require: true,
                      message: '请填写优惠价格',
                    },
                  ],
                })(<Input placeholder="请填写优惠价格" />)}
              </FormItem>
              <FormItem {...formLayout} label="要求（满减）">
                {form.getFieldDecorator('require', {
                  rules: [
                    {
                      require: true,
                      message: '请填写要求（满减）',
                    },
                  ],
                })(<Input placeholder="请填写要求（满减）" />)}
              </FormItem>
              <FormItem {...formLayout} label="团购过期时间">
                {form.getFieldDecorator('expiredDate', {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                })(
                  <DatePicker
                    showTime
                    placeholder="请选择"
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
              <FormItem {...formLayout} label="数量">
                {form.getFieldDecorator('number', {
                  rules: [
                    {
                      required: true,
                      message: '请输入数量！',
                    },
                  ],
                })(<InputNumber min={0} max={9999} step={0.01} />)}
              </FormItem>
              <FormItem {...formLayout} label="类型">
                {form.getFieldDecorator('type', {
                  rules: [
                    {
                      required: true,
                      message: '请选择类型',
                    },
                  ],
                })(
                  <Select style={{ width: 260 }} placeholder='请选择类型'>
                    <Option key="ordinary" value="ordinary">
                      普通
                    </Option>
                    <Option key="special" value="special">
                      会员专属
                    </Option>
                  </Select>
                )}
              </FormItem>
              <FormItem {...formLayout} label="需求积分">
                {form.getFieldDecorator('requirePoint', {
                  rules: [
                    {
                      require: true,
                      message: '请填写需求积分',
                    },
                  ],
                })(<Input placeholder="请填写需求积分" />)}
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

    return (
      <Query
        query={gql`
          query{
            issueCoupon(type: ordinary){
              id
              amount
              require
              expiredDate
              number
              requirePoint
              type
              status
              draw
            }
          }
        `}
      >
        {({ loading, data: { issueCoupon }, refetch }) => {
          if (loading) return <Spin />;
          refetch();

          const ListContent = ({ data: { status, amount, require, expiredDate, number } }) => (
            <div className={styles.listContent}>
              <div className={styles.listContentItem}>
                <p>优惠价格</p>
                <p>{amount/100}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>需求价格</p>
                <p>{require/100}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>过期时间</p>
                <p>{moment(String(expiredDate)).format('YYYY-MM-DD')}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>数量</p>
                <p>{number}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>状态</p>
                <p>{status && status === 'published'?'上架':'下架'}</p>
              </div>
            </div>
          );

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
                  deleteIssueCoupon(id: $id)
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
                          pagination
                          dataSource={issueCoupon}
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
                                  onClick={() => {
                                    editAndDelete(item.id);
                                    Modal.confirm({
                                      title: '删除优惠券',
                                      content: '确定删除该优惠券吗？',
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
                              <List.Item.Meta title={item.id} description={item.content} />
                              <ListContent data={item} />
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
                    {/* <ShelvesIssueCoupon
                      {...ShelvesparentMethods}
                      data={getlistitem}
                      ShelvesmodalVisible={ShelvesmodalVisible}
                      refetch={refetch}
                    /> */}
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
