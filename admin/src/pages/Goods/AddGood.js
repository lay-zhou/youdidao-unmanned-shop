import React, { PureComponent } from 'react';
import { Form, Input, message, Card, InputNumber, Select, Spin, Button } from 'antd';
import gql from 'graphql-tag';
import router from 'umi/router';
import { Mutation, Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ImagesUploader from '@/components/ImagesUploader';
import { FormattedMessage } from 'umi-plugin-react/locale';
// import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

@Form.create()
class AddGood extends PureComponent {
  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    
    const { submitting } = this.props;

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <PageHeaderWrapper title="添加商品" content="请填写完整的参数">
        <Query
          query={gql`
            query{
              classify {
                id
                title
                imageUrl
              }
            }
          `}
        >
          {({ loading, data:{ classify } }) => {
            if (loading) return <Spin />
            return(
              <Mutation
                mutation={gql`
                  mutation(
                    $code: ID
                    $imageKey: String
                    $name: String
                    $content: String
                    $originalPrice: Int
                    $price: Int
                    $commission: Int
                    $unit: String
                    $stock: Int
                    $type: ItemType
                    $kind: ItemType
                    $itemClassifyId: ID
                    $pointDiscountPrice: Int
                    $memberPrice: Int
                  ) {
                    createItem(
                      input: {
                        # 条形码
                        code: $code
                        # 主图
                        imageKey: $imageKey
                        # 名称
                        name: $name
                        # 简介
                        content: $content
                        # 原价
                        originalPrice: $originalPrice
                        # 价格
                        price: $price
                        # 佣金
                        commission: $commission
                        # 单位
                        unit: $unit
                        # 库存
                        stock: $stock
                        # 类型
                        type: $type
                        # 专享/普通
                        kind: $kind
                        # 商品分类ID
                        itemClassifyId: $itemClassifyId
                        # 会员价
                        memberPrice: $memberPrice
                        # 最大抵扣金额
                        pointDiscountPrice: $pointDiscountPrice
                      }
                    ) {
                      code
                      name
                      imageUrl
                      content
                      originalPrice
                      commission
                      price
                      unit
                      stock
                      pointDiscountPrice
                      type
                      kind
                      status
                      followed
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
                        // 条形码
                        if (fieldsValue.code) {
                          adddata.code = fieldsValue.code;
                        } else {
                          message.error('请输入商品条形码');
                          return;
                        }
                        // 商品名称
                        if (fieldsValue.name) {
                          adddata.name = fieldsValue.name;
                        } else {
                          message.error('请输入商品名称');
                          return;
                        }
                        // 单位
                        if (fieldsValue.unit) {
                          adddata.unit = fieldsValue.unit;
                        } else {
                          message.error('请输入商品单位');
                          return;
                        }
                        // 商品图片
                        if (fieldsValue.imageKey) {
                          adddata.imageKey = String(fieldsValue.imageKey);
                        } else {
                          message.error('请上传商品图片');
                          return;
                        }

                        // 简介
                        if (fieldsValue.content) {
                          adddata.content = fieldsValue.content;
                        } else {
                          message.error('请输入简介');
                          return;
                        }
                        // 商品分类ID
                        if (fieldsValue.itemClassifyId) {
                          adddata.itemClassifyId = fieldsValue.itemClassifyId;
                        } else {
                          message.error('请输入商品分类ID');
                          return;
                        }
                        // 库存
                        if (fieldsValue.stock) {
                          adddata.stock = fieldsValue.stock;
                        } else {
                          message.error('请输入库存');
                          return;
                        }
                        // 商品价格
                        if (fieldsValue.price) {
                          adddata.price = fieldsValue.price*1000/10;
                        } else {
                          message.error('请输入价格');
                          return;
                        }
                        // 商品原价
                        if (fieldsValue.originalPrice) {
                          adddata.originalPrice = fieldsValue.originalPrice*1000/10;
                        } else {
                          message.error('请输入原价');
                          return;
                        }
                        // 会员价
                        if (fieldsValue.memberPrice) {
                          adddata.memberPrice = fieldsValue.memberPrice*1000/10;
                        } else {
                          message.error('请输入会员价');
                          return;
                        }
                        // 积分抵扣金额
                        if (fieldsValue.pointDiscountPrice) {
                          adddata.pointDiscountPrice = fieldsValue.pointDiscountPrice*1000/10;
                        } else {
                          adddata.pointDiscountPrice = 0;
                        }
                        // 商品类型
                        if (fieldsValue.type) {
                          adddata.type = String(fieldsValue.type);
                        } else {
                          message.error('请输入商品类型');
                          return;
                        }
                        // 商品品类 专享/普通
                        if (fieldsValue.kind) {
                          adddata.kind = String(fieldsValue.kind);
                        } else {
                          message.error('请输入商品品类');
                          return;
                        }
                        // 佣金
                        if (fieldsValue.commission) {
                          if (fieldsValue.commission < fieldsValue.price) {
                            adddata.commission = fieldsValue.commission*100
                          } else {
                            message.error('佣金不能大于价格');
                            return;
                          }
                        } else {
                          adddata.commission = 0;
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
                              router.push(`/Goods/GraftGoods`);
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
                        <FormItem {...formLayout} label="商品条形码">
                          {getFieldDecorator('code', {
                            rules: [
                              {
                                required: true,
                                message: '请输入商品条形码',
                                pattern: /^[0-9]{13}$/,
                              },
                            ],
                          })(<Input placeholder="请输入商品条形码" />)}
                        </FormItem>
                        <FormItem {...formLayout} label="商品名称">
                          {getFieldDecorator('name', {
                            rules: [
                              {
                                required: true,
                                message: '请输入商品名称！',
                              },
                            ],
                          })(<Input placeholder="请输入商品名称" />)}
                        </FormItem>
                        <FormItem {...formLayout} label="商品图片">
                          {getFieldDecorator('imageKey', {
                            required: true,
                            message: '请上传封面图片！',
                          })(<ImagesUploader />)}
                        </FormItem>
                        <FormItem {...formLayout} label="商品简介">
                          {getFieldDecorator('content', {
                            rules: [
                              {
                                required: true,
                                message: '请输入商品简介！',
                              },
                            ],
                          })(<TextArea rows={4} placeholder="请输入不少于10个字的商品描述" />)}
                        </FormItem>
                        {classify ? (
                          <FormItem {...formLayout} label="商品分类ID">
                            {getFieldDecorator('itemClassifyId')(
                              <Select style={{ width: 120 }} placeholder='请选择商品分类'>
                                {classify.map(currentValue => (
                                  <Option key={currentValue.id} value={currentValue.id}>
                                    {currentValue.title}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          </FormItem>
                        ) : null}
                        <FormItem {...formLayout} label="单位">
                          {getFieldDecorator('unit', {
                            rules: [
                              {
                                required: true,
                                message: '请输入单位！',
                              },
                            ],
                          })(<Input placeholder="请输入单位" />)}
                        </FormItem>
                        <FormItem {...formLayout} label="价格">
                          {getFieldDecorator('price', {
                            rules: [
                              {
                                required: true,
                                message: '请输入价格！',
                              },
                            ],
                          })(<InputNumber min={0} step={1} placeholder='请输入价格' />)}
                        </FormItem>
                        <FormItem {...formLayout} label="会员价">
                          {getFieldDecorator('memberPrice', {
                            rules: [
                              {
                                required: true,
                                message: '请输入会员价！',
                              },
                            ],
                          })(<InputNumber min={0} step={1} placeholder='请输入会员价' />)}
                        </FormItem>
                        <FormItem {...formLayout} label="佣金">
                          {getFieldDecorator('commission', {
                            rules: [
                              {
                                required: true,
                                message: '请输入佣金！',
                              },
                            ],
                          })(<InputNumber min={0} step={1} placeholder='请输入佣金' />)}
                        </FormItem>
                        <FormItem {...formLayout} label="积分抵扣金额">
                          {getFieldDecorator('pointDiscountPrice', {
                            rules: [
                              {
                                required: true,
                                message: '请输入积分抵扣金额！',
                              },
                            ],
                          })(<InputNumber min={0} step={1} placeholder='请输入积分抵扣金额' />)}
                        </FormItem>
                        <FormItem {...formLayout} label="库存">
                          {getFieldDecorator('stock', {
                            rules: [
                              {
                                required: true,
                                message: '请输入库存！',
                              },
                            ],
                          })(<InputNumber min={0} max={999} placeholder='请输入库存' />)}
                        </FormItem>
                        <FormItem {...formLayout} label="原价">
                          {getFieldDecorator('originalPrice', {
                            rules: [
                              {
                                required: true,
                                message: '请输入原价！',
                              },
                            ],
                          })(<InputNumber min={0} step={1} placeholder='请输入原价' />)}
                        </FormItem>
                        <FormItem {...formLayout} label="商品类型">
                          {getFieldDecorator('type', {
                            rules: [
                              {
                                required: true,
                                message: '请选择商品类型',
                              },
                            ],
                          })(
                            <Select style={{ width: 260 }} placeholder="请选择商品类型">
                              <Option key="ordinary" value="ordinary">
                                可退款
                              </Option>
                              <Option key="special" value="special">
                                不可退款
                              </Option>
                            </Select>
                          )}
                        </FormItem>
                        <FormItem {...formLayout} label="商品品类">
                          {getFieldDecorator('kind', {
                            rules: [
                              {
                                required: true,
                                message: '请选择商品品类',
                              },
                            ],
                          })(
                            <Select style={{ width: 260 }} placeholder="请选择商品品类">
                              <Option key="ordinary" value="ordinary">
                                普通
                              </Option>
                              <Option key="special" value="special">
                                专享
                              </Option>
                            </Select>
                          )}
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
            );
          }}
        </Query>
      </PageHeaderWrapper>
    );
  }
}

export default AddGood;
