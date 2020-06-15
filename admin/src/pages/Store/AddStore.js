import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Card, message, Select } from 'antd';
import gql from 'graphql-tag';
import router from 'umi/router';
import { Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ImagesUploader from '@/components/ImagesUploader';
// import styles from './index.less';
const { Option } = Select;
const FormItem = Form.Item;

@Form.create()
class Item extends PureComponent {
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

    return (
      <PageHeaderWrapper title="添加店铺" content="请填写完整的参数">
        <Mutation
          mutation={gql`
            mutation(
              $imageKey: String
              $name: String
              $address: String
              $longitude: String
              $latitude: String
              $phone: String
              $type: ItemType
            ) {
              createStore(
                input: {
                  name: $name
                  address: $address
                  longitude: $longitude
                  latitude: $latitude
                  imageKey: $imageKey
                  phone: $phone
                  type: $type
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
                  console.log('fieldsValue', fieldsValue);

                  // 店铺名称
                  if (fieldsValue.name) {
                    adddata.name = fieldsValue.name;
                  } else {
                    message.error('请输入店铺名称');
                    return;
                  }

                  // 店铺图片
                  if (fieldsValue.imageKey) {
                    adddata.imageKey = String(fieldsValue.imageKey);
                  } else {
                    message.error('请上传店铺图片');
                    return;
                  }

                  // 店铺经度
                  if (fieldsValue.longitude) {
                    adddata.longitude = fieldsValue.longitude;
                  } else {
                    message.error('请输入店铺经度');
                    return;
                  }
                  // 店铺纬度
                  if (fieldsValue.latitude) {
                    adddata.latitude = fieldsValue.latitude;
                  } else {
                    message.error('请输入店铺纬度');
                    return;
                  }
                  // 店铺地址
                  if (fieldsValue.address) {
                    adddata.address = fieldsValue.address;
                  } else {
                    message.error('请输入店铺地址');
                    return;
                  }
                  // 类型
                  if (fieldsValue.type) {
                    adddata.type = fieldsValue.type;
                  } else {
                    message.error('请输入店铺类型');
                    return;
                  }
                  // 手机号
                  if (fieldsValue.phone) {
                    adddata.phone = fieldsValue.phone;
                  } else {
                    message.error('请输入手机号');
                    return;
                  }
                  if (!err) {
                    try {
                      const promise = new Promise(resolve => {
                        console.log('adddata', adddata);
                        resolve(mutate({ variables: adddata }));
                      });
                      promise.then(value => {
                        console.log(value);
                        message.success('新建成功');
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
                <Form style={{ marginTop: 8 }} onSubmit={handleSubmit}>
                  <FormItem {...formItemLayout} label="店铺名称">
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: false,
                          message: '请填写店铺名称',
                        },
                      ],
                    })(<Input placeholder="请输入店铺名称" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="店铺图片">
                    {getFieldDecorator('imageKey', {
                      rules: [
                        {
                          required: false,
                        },
                      ],
                    })(<ImagesUploader num={1} />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="店铺经度">
                    {getFieldDecorator('longitude', {
                      rules: [
                        {
                          required: false,
                          message: '请填写店铺经度',
                        },
                      ],
                    })(<Input placeholder="请输入店铺经度" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="店铺纬度">
                    {getFieldDecorator('latitude', {
                      rules: [
                        {
                          required: false,
                          message: '请填写店铺纬度',
                        },
                      ],
                    })(<Input placeholder="请输入店铺纬度" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="店铺地址">
                    {getFieldDecorator('address', {
                      rules: [
                        {
                          required: false,
                          message: '请填写店铺地址',
                        },
                      ],
                    })(<Input placeholder="请输入店铺地址" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="店铺类型">
                    {getFieldDecorator('type', {
                      rules: [
                        {
                          required: false,
                          message: '请填写店铺类型',
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

                  <FormItem {...submitFormLayout} style={{ marginTop: 32, textAlign: 'center' }}>
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
      </PageHeaderWrapper>
    );
  }
}

export default Item;
