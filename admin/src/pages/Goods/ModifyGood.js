import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Card, message, Spin, InputNumber, Select } from 'antd';
import gql from 'graphql-tag';
import router from 'umi/router';
import { Mutation, Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ImagesUploader from '@/components/ImagesUploader';
// import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
class ModifyGood extends PureComponent {
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
    const itemId = hash.split('ModifyGood/')[1];
    
    return (
      <PageHeaderWrapper title="修改商品" content="请填写完整的参数">
        <Query
          query={gql`
            query(
              $code: ID!
            ){
              item(code: $code){
                code
                name
                imageUrl
                content
                pointDiscountPrice
                originalPrice
                commission
                memberPrice
                price
                unit
                stock
                type
                status
              }
              classify {
                id
                title
                imageUrl
              }
            }
          `}
          variables={{ code: itemId }}
        >
          {({ loading, data: { item, classify } }) => {
            if (loading) return <Spin />;
            return (
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
                  ){
                    updateItem(
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
                        # 最大抵扣金额
                        pointDiscountPrice: $pointDiscountPrice
                        # 会员价
                        memberPrice: $memberPrice
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
                    const modifyData = {};
                    if (e) {
                      e.preventDefault();
                      form.validateFields((err, fieldsValue) => {
                        modifyData.code = itemId;
                        // 商品名称
                        if (fieldsValue.name) modifyData.name = fieldsValue.name;
                        // 商品主图
                        if (fieldsValue.imageKey) modifyData.imageKey = String(fieldsValue.imageKey);
                        // 商品简介
                        if (fieldsValue.content) modifyData.content = fieldsValue.content;
                        // 商品原价
                        if (fieldsValue.originalPrice) modifyData.originalPrice = fieldsValue.originalPrice*1000/10;
                        // 商品佣金
                        if (fieldsValue.commission) {
                          if (fieldsValue.commission < fieldsValue.price) {
                            modifyData.commission = fieldsValue.commission*1000/10
                          } else {
                            message.error('佣金不能大于价格');
                            return;
                          }
                        }

                        // 积分抵扣金额
                        if (fieldsValue.pointDiscountPrice) {
                          modifyData.pointDiscountPrice = fieldsValue.pointDiscountPrice*1000/10;
                        } 

                        // 商品价格
                        if (fieldsValue.price) modifyData.price = fieldsValue.price*1000/10;
                        // 商品价格
                        if (fieldsValue.memberPrice) modifyData.memberPrice = fieldsValue.memberPrice*1000/10;
                        // 商品单位
                        if (fieldsValue.unit) modifyData.unit = fieldsValue.unit;
                        // 商品库存
                        if (fieldsValue.stock) modifyData.stock = fieldsValue.stock;
                        // 商品类型
                        if (fieldsValue.type) modifyData.type = fieldsValue.type;
                        // 商品品类
                        if (fieldsValue.kind) modifyData.kind = fieldsValue.kind;
                        // 商品分类
                        if (fieldsValue.itemClassId) modifyData.itemClassifyId = fieldsValue.itemClassId;
                  
                        if (!err) {
                          try {
                            const promise = new Promise(resolve => {
                              console.log('adddata', modifyData);
                              resolve(mutate({ variables: modifyData }));
                            });
                            promise.then(value => {
                              console.log(value);
                              message.success('修改成功');
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
                      <Form style={{ marginTop: 8 }} onSubmit={this.handleSubmit}>
                        <FormItem {...formItemLayout} label="商品名称">
                          {getFieldDecorator('name', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品名称',
                              },
                            ],
                          })(<Input placeholder={item ? item.name : null} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品图片">
                          {getFieldDecorator('imageKey', {
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<ImagesUploader />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品简介">
                          {getFieldDecorator('content', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品简介',
                              },
                            ],
                          })(<Input placeholder={item ? item.content : '商品简介'} />)}
                        </FormItem>
                        {classify ? (
                          <FormItem {...formItemLayout} label="商品分类ID">
                            {getFieldDecorator('itemClassId')(
                              <Select style={{ width: 120 }} placeholder='请选择商品分类'>
                                {classify.map(currentValue => (
                                  <Option key={currentValue.id} value={currentValue.id}>
                                    {`${currentValue.title}(${currentValue.id})`}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          </FormItem>
                        ) : null}
                        <FormItem {...formItemLayout} label="商品原价">
                          {getFieldDecorator('originalPrice', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品原价',
                              },
                            ],
                          })(<InputNumber placeholder={item ? item.originalPrice/100 : '商品原价'} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品佣金">
                          {getFieldDecorator('commission', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品佣金',
                              },
                            ],
                          })(<InputNumber min={0} step={1} placeholder={item ? item.commission/100 : '请输入佣金'} />)}
                        </FormItem>
                        
                        <FormItem {...formItemLayout} label="积分抵扣金额">
                          {getFieldDecorator('pointDiscountPrice', {
                            rules: [
                              {
                                required: false,
                                message: '请输入积分抵扣金额！',
                              },
                            ],
                          })(<InputNumber min={0} step={1} placeholder={item ? item.pointDiscountPrice/100 : '积分抵扣金额'} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品价格">
                          {getFieldDecorator('price', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品价格',
                              },
                            ],
                          })(<InputNumber placeholder={item ? item.price/100 : '商品价格'} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="会员价">
                          {getFieldDecorator('memberPrice', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品会员价',
                              },
                            ],
                          })(<InputNumber placeholder={item ? item.memberPrice/100 : '商品会员价'} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品单位">
                          {getFieldDecorator('unit', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品单位',
                              },
                            ],
                          })(<Input placeholder={item ? item.unit : '商品单位'} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品库存">
                          {getFieldDecorator('stock', {
                            rules: [
                              {
                                required: false,
                                message: '请输入库存！',
                              },
                            ],
                          })(<Input placeholder={item ? item.stock : '商品库存'} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品类型">
                          {getFieldDecorator('type', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品类型',
                              },
                            ],
                          })(
                            <Select style={{ width: 260 }} placeholder={item && item.type === 'ordinary' ? '可退款' : '不可退款'}>
                              <Option key="ordinary" value="ordinary">
                                可退款
                              </Option>
                              <Option key="special" value="special">
                                不可退款
                              </Option>
                            </Select>
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品品类">
                          {getFieldDecorator('kind', {
                            rules: [
                              {
                                required: false,
                                message: '请填写商品品类',
                              },
                            ],
                          })(
                            <Select style={{ width: 260 }} placeholder={item && item.kind === 'ordinary' ? '普通' : '专享'}>
                              <Option key="ordinary" value="ordinary">
                                普通
                              </Option>
                              <Option key="special" value="special">
                                专享
                              </Option>
                            </Select>
                          )}
                        </FormItem>
                        {/* <FormItem {...formItemLayout} label="关注情况">
                          {getFieldDecorator('followed', {
                            rules: [
                              {
                                required: false,
                                message: '请选择关注情况',
                              },
                            ],
                          })(<Switch checkedChildren="关注" unCheckedChildren="取消关注" defaultChecked />)}
                        </FormItem> */}
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

export default ModifyGood;
