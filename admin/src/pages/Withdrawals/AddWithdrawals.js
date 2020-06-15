import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import {
  Form,
  Button,
  Card,
  message,
  Spin,
} from 'antd';
import gql from 'graphql-tag';
import router from 'umi/router';
import { Mutation, Query } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
// import styles from './index.less';

const FormItem = Form.Item;

@Form.create()
class Item extends PureComponent {
  state = {
      
  };

  render() {
    const { submitting } = this.props;

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <Query
        query={gql`
          query{
            userInfo{
              id
              imageUrl
              nickname
              balance
              point
              role
              phone
              follow
            }

          }
        `}
      >
        {({ loading, data: { userInfo }, refetch }) => {
          if (loading) return <Spin />;
          console.log('userInfo',userInfo);
          refetch();
          return(
            <PageHeaderWrapper title="我的余额">
              <Mutation
                mutation={gql`
                  mutation(
                      $remark: String,
                  ) {
                  toApplyForCashWithdrawals(input:{
                      remark: $remark,
                  }) {
                      id
                      name
                      price
                      phone
                      account
                      remark
                      status
                      }
                  }
                `}
              >
                {(mutate, error) => {
                  const handleSubmit = e => {
                    if (error) {
                      message.error('请确保已绑定银行卡！');
                    }
                    const { form } = this.props;
                    const adddata = {};
                    if (e) {
                      e.preventDefault();
                      form.validateFields((fieldsValue) => {
                        console.log('fieldsValue',fieldsValue);
                        if(!userInfo.price && userInfo.price < 1000 ){
                          message.error('余额不足10无法提现');
                          return;
                        }
                        try {
                          const promise = new Promise(resolve => {
                          console.log('adddata', adddata);
                          resolve(mutate({ variables: adddata }));
                          });
                          promise.then(value => {
                          console.log(value);
                          message.success('申请成功');
                          router.push(`/finance/bill`);
                          });
                        } catch (catchedError) {
                            //
                        }
                    });
                  }
              };
              return (
                <Card bordered={false}>
                  <Form style={{ marginTop: 8 }} onSubmit={this.handleSubmit}>
                    <div
                      type="primary"
                      style={{ textAlign: 'center' }}
                    >
                      我的余额:<span style={{ color:'red' }}>{userInfo.balance/100}</span>元
                      <br />
                      (满10才可提现，默认全部提现，暂不支持修改提现金额)
                    </div>
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
          )
        }}
      </Query>
    );
  }
}

export default Item;
