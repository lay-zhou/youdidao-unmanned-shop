import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Card, message, Spin, Select } from 'antd';
import gql from 'graphql-tag';
import router from 'umi/router';
import { Mutation, Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ImagesUploader from '@/components/ImagesUploader';
// import styles from './index.less';
const { Option } = Select;
const FormItem = Form.Item;

@Form.create()
class Item extends PureComponent {
  state = {};

  render() {
    const { submitting } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    // 截取路由
    const urlParams = new URL(window.location.href);
    const { hash } = urlParams;
    const itemId = hash.split('ModifyStore/')[1];
    

    return (
      <PageHeaderWrapper title="修改店铺" content="请填写完整的参数">
        <Query
          query={gql`
            query(
              $id: ID!
            ){
              store(id: $id){
                id
                imageUrl
                name
                address
                longitude
                latitude
                distance
                sales
                balance
                status
              }
            }
          `}
          variables={{ id: itemId }}
        >
          {({ loading, data: { store } }) => {
            if (loading) return <Spin />;
            return (
              <Mutation
                mutation={gql`
                  mutation(
                    $id: ID!
                    $imageKey: String
                    $name: String
                    $type: ItemType
                    $address: String
                    $longitude: String
                    $latitude: String
                    $phone: String
                  ) {
                    updateStore(
                      input: {
                        id: $id
                        name: $name
                        type: $type
                        address: $address
                        longitude: $longitude
                        latitude: $latitude
                        imageKey: $imageKey
                        phone: $phone
                      }
                    ) {
                      id
                      imageUrl
                      name
                      type
                      address
                      longitude
                      latitude
                      distance
                      sales
                      balance
                      status
                    }
                  }
                `}
              >
                {mutate => {
                  const handleSubmit = e => {
                    const { form } = this.props;
                    const adddata = {};
                    if (e) {
                      e.preventDefault();
                      form.validateFields((err, fieldsValue) => {

                        // 商户名称
                        if (fieldsValue.name) adddata.name = fieldsValue.name;
                        // 商户图片
                        if (fieldsValue.imageKey) adddata.imageKey = String(fieldsValue.imageKey);
                        // 商户经度
                        if (fieldsValue.longitude) adddata.longitude = fieldsValue.longitude;
                        // 商户纬度
                        if (fieldsValue.latitude) adddata.latitude = fieldsValue.latitude;
                        // 商户地址
                        if (fieldsValue.address) adddata.address = fieldsValue.address;
                       // 商户类型
                        if (fieldsValue.type) adddata.type = fieldsValue.type;
                        // 商户联系方式
                        if (fieldsValue.phone) adddata.phone = fieldsValue.phone;

                        adddata.id = itemId;

                        if (!err) {
                          try {
                            const promise = new Promise(resolve => {
                              console.log('adddata', adddata);
                              resolve(mutate({ variables: adddata }));
                            });
                            promise.then(value => {
                              console.log(value);
                              message.success('修改成功');
                              router.push(`/Store/GraftStore`);
                            });
                          } catch (catchedError) {
                            //
                          }
                        }
                      });
                    }
                  };
                  return (
                    <Card bordered={false}>
                      <Form style={{ marginTop: 8 }} onSubmit={this.handleSubmit}>
                        <FormItem {...formItemLayout} label="商户名称">
                          {getFieldDecorator('name', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商户名称',
                              },
                            ],
                          })(<Input placeholder={store ? store.name : null} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商户图片">
                          {getFieldDecorator('imageKey', {
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<ImagesUploader num={1} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商户经度">
                          {getFieldDecorator('longitude', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商户经度',
                              },
                            ],
                          })(<Input placeholder={store ? store.longitude : null} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商户纬度">
                          {getFieldDecorator('latitude', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商户纬度',
                              },
                            ],
                          })(<Input placeholder={store ? store.latitude : null} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商户地址">
                          {getFieldDecorator('address', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商户地址',
                              },
                            ],
                          })(<Input placeholder={store ? store.address : null} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商户类型">
                          {getFieldDecorator('type', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商户类型',
                              },
                            ],
                          })(
                            <Select style={{ width: 260 }} placeholder="请选择店铺类型">
                              <Option key="ordinary" value="ordinary">
                                普通
                              </Option>
                              <Option key="special" value="special">
                                专享
                              </Option>
                            </Select>
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="手机号">
                          {getFieldDecorator('phone', {
                            rules: [
                              {
                                required: false,
                                message: '请输入手机号',
                                pattern: /^1[3456789]\d{9}$/,
                              },
                            ],
                          })(<Input placeholder="请输入手机号" />)}
                        </FormItem>
                        <FormItem
                          {...submitFormLayout}
                          style={{ marginTop: 32, textAlign: 'center' }}
                        >
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            onClick={handleSubmit}
                          >
                            <FormattedMessage id="form.submit" />
                          </Button>
                        </FormItem>
                      </Form>
                    </Card>
                  );
                }}
              </Mutation>
            );
          }}
        </Query>
      </PageHeaderWrapper>
    );
  }
}

export default Item;
