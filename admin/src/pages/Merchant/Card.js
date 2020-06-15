import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Icon,
  Modal,
} from 'antd';
import gql from 'graphql-tag';
// import router from 'umi/router';
import Result from '@/components/Result';
import { Mutation, Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
// import styles from './index.less';

const FormItem = Form.Item;

const Binding = Form.create()(props => {
    const { modalVisible, form, handleModalVisible, formLayout, refetch, data } = props;
    
    const cardNoStyle = (event) => {
      return event.target.value = numDivide(event.target.value);
    }
  
    const numDivide = (num) => {
      let str = '' ;
      const reg =   /\s/g;// 加入正则，过滤掉字符串中的空格
      num.replace( reg, "").split('').map(function (item,index) {
          (index+1) % 4 == 0 ? str = str + item + ' ': str += item;
      })
      return str;
    }

    return (
      <Mutation
        mutation={gql`
        mutation(
            $name: String
            $phone: String
            $account: String
            $card: String
            $openId: String
        ){
            updateAccount(input: {
                name: $name
                phone: $phone
                account: $account
                card: $card
                openId: $openId
            }){
                name
                phone
                account
                card
                openId
            }
            }
        `}
      >
        {mutate => {
          const handleSubmit = e => {
            const auditData = {};
            if (e) {
                if (e.name) auditData.name = e.name;
                if (e.phone) auditData.phone = e.phone;
                if (e.account) auditData.account = e.account;
                if (e.card) auditData.card = e.card;
              try {
                const promise = new Promise(resolve => {
                  resolve(mutate({ variables: auditData }));
                });
                promise.then(value => {
                  console.log(value);
                  message.success('修改成功');
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
              title="修改绑定"
              visible={modalVisible}
              onOk={() => {
                form.validateFields((err, fieldsValue) => {
                  if (err) return;
                  handleSubmit(fieldsValue);
                });
              }}
              onCancel={() => handleModalVisible()}
            >
              <FormItem {...formLayout} label="收款人">
                {form.getFieldDecorator('name', {
                rules: [
                    {
                    required: false,
                    message: '请填写收款人姓名',
                    },
                ],
                })(<Input placeholder={data?data.name:'请填写收款人姓名'} />)}
              </FormItem>
              <FormItem {...formLayout} label="手机号">
                {form.getFieldDecorator('phone', {
                rules: [
                    {
                    required: false,
                    message: '请输入手机号码',
                    },
                ],
                })(<Input placeholder={data?data.phone:'请输入手机号码'} />)}
              </FormItem>
              <FormItem {...formLayout} label="开户银行">
                {form.getFieldDecorator('account', {
                    rules: [
                        {
                        required: false,
                        message: '请输入开户银行',
                        },
                    ],
                    })(<Input placeholder={data?data.account:'请输入开户银行'} />)}
              </FormItem>
              <FormItem {...formLayout} label="银行卡号">
                {form.getFieldDecorator('card', {
                rules: [
                    {
                    required: false,
                    message: '请输入银行卡号',
                    },
                    {
                      pattern: /^(?!.*[a-zA-Z])\s*\d/,
                      message: '请输入正确的银行卡号',
                    },
                ],
                })(<Input
                  onBlur={cardNoStyle}
                  placeholder={data?data.card:'请输入银行卡号'}
                />)}
              </FormItem>
            </Modal>
          );
        }}
      </Mutation>
    );
  });

@Form.create()
class Item extends PureComponent {
  state = {
      
  };

  handleModalVisible = (flag,account) => {
    this.setState({
      modalVisible: !!flag,
      audit: account,
    });
  };

  cardNoStyle = (event) => {
    return event.target.value = this.numDivide(event.target.value);
  }

  numDivide = (num) => {
    let str = '' ;
    const reg =   /\s/g;// 加入正则，过滤掉字符串中的空格
    num.replace( reg, "").split('').map(function (item,index) {
        (index+1) % 4 == 0 ? str = str + item + ' ': str += item;
    })
    return str;
}

  render() {
    const { submitting } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;

    const { modalVisible, audit } = this.state;

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

    const formLayout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 13 },
    };

    const parentMethods = {
        handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderWrapper title="绑定收款">
        <Query
          query={gql`
            query{
              account{
                  name
                  phone
                  account
                  card
                  openId
              }
            }
            `}
        >
          {({ loading, data: { account }, refetch }) => {
          if (loading) return <Spin />;
          console.log('account',account);
          
          return(
            <Mutation
              mutation={gql`
                mutation(
                    $name: String
                    $phone: String
                    $account: String
                    $card: String
                    $openId: String
                ){
                    addAccount(input: {
                        name: $name
                        phone: $phone
                        account: $account
                        card: $card
                        openId: $openId
                    }){
                        name
                        phone
                        account
                        card
                        openId
                    }
                    }
              `}
            >
              {mutate => {
                const handleSubmit = e => {
                    const { form } = this.props;
                    const addData = {};
                    if (e) {
                        e.preventDefault();
                        form.validateFields((err, fieldsValue) => {
                            if(fieldsValue.name){
                              addData.name = fieldsValue.name;
                            }else{
                              message.error('请输入收款人姓名');
                              return;
                            }
                            if(fieldsValue.phone){
                              addData.phone = fieldsValue.phone;
                            }else{
                              message.error('请输入收款人手机号');
                              return;
                            }
                            if(fieldsValue.account){
                              addData.account = fieldsValue.account;
                            }else{
                              message.error('请输入收款人开户银行');
                              return;
                            }
                            if(fieldsValue.card){
                              addData.card = fieldsValue.card;
                            }else{
                              message.error('请输入收款人银行卡号');
                              return;
                            }
                            try {
                                const promise = new Promise(resolve => {
                                  console.log('adddata',addData);
                                  
                                resolve(mutate({ variables: addData }));
                                });
                                promise.then(value => {
                                console.log(value);
                                message.success('提交成功');
                                refetch();
                                });
                            } catch (catchedError) {
                                //
                            }
                    });
                }
            };
            return (
              <Card bordered={false}>
                {
                  account?
                    <Card bordered={false}>
                      <Binding
                        {...parentMethods}
                        data={audit}
                        modalVisible={modalVisible}
                        formLayout={formLayout}
                        refetch={refetch}
                      />
                      <Result
                        type="success"
                        icon={<Icon type="smile" theme="twoTone" />}
                        title="绑定成功"
                        actions={<Button type="primary" onClick={() => this.handleModalVisible(true, account)}>点击修改</Button>}
                      />
                    </Card>
                :
                    <Form style={{ marginTop: 8 }} onSubmit={this.handleSubmit}>
                      <FormItem {...formItemLayout} label="收款人">
                        {getFieldDecorator('name', {
                        rules: [
                            {
                            required: true,
                            message: '请填写收款人姓名',
                            },
                        ],
                        })(<Input placeholder="请填写姓名" />)}
                      </FormItem>
                      <FormItem {...formItemLayout} label="手机号">
                        {getFieldDecorator('phone', {
                        rules: [
                            {
                            required: true,
                            message: '请输入手机号码',
                            },
                        ],
                        })(<Input placeholder="请输入手机号码" />)}
                      </FormItem>
                      <FormItem {...formItemLayout} label="开户银行">
                        {getFieldDecorator('account', {
                            rules: [
                                {
                                required: true,
                                message: '请输入开户银行',
                                },
                            ],
                            })(<Input placeholder="请输入开户银行" />)}
                      </FormItem>
                      <FormItem {...formItemLayout} label="银行卡号">
                        {getFieldDecorator('card', {
                        rules: [
                            {
                            required: true,
                            message: '请输入银行卡号',
                            },
                            {
                              pattern: /^(?!.*[a-zA-Z])\s*\d/,
                              message: '请输入正确的银行卡号',
                            },
                        ],
                        })(<Input 
                          onInput={this.getValue} 
                          onBlur={this.cardNoStyle}
                          placeholder="请输入银行卡号" 
                        />)}
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
              }
              </Card>
            );
          }}
            </Mutation>
            )
          }}
        </Query>
      </PageHeaderWrapper>
    );
  }
}

export default Item;
