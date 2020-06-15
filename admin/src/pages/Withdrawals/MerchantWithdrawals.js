import React, { PureComponent } from 'react';
import {
  Form,
  Button,
  Card,
  message,
  Spin,
} from 'antd';
import gql from 'graphql-tag';
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
            myStore{
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
      >
        {({ loading, data: { myStore }, refetch }) => {
          if (loading) return <Spin />;
          console.log('myStore',myStore);
          
          return(
            <PageHeaderWrapper title="我的余额">
              <Mutation
                mutation={gql`
                  mutation{
                    merchantWithdrawals{
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
                {mutate => {
                  const handleSubmit = e => {
                    const { form } = this.props;
                    const adddata = {};
                    if (e) {
                      e.preventDefault();
                      form.validateFields((err, fieldsValue) => {
                        console.log('fieldsValue',fieldsValue);
                        if(myStore.balance && myStore.balance >= 1000 ){
                          try {
                            const promise = new Promise(resolve => {
                              console.log('adddata', adddata);
                              resolve(mutate({ variables: adddata }));
                              });
                              promise.then(value => {
                              console.log(value);
                              message.success('申请成功');
                              refetch();
                              });
                          } catch (catchedError) {
                              //
                          }
                        }else {
                          message.error('余额不足10无法提现');
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
                      我的余额:<span style={{ color:'red' }}>{myStore.balance/100}</span>元
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
                        申请提现
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
