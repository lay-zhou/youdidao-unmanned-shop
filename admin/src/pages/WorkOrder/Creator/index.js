import { Button, Card, Form, Input, message } from 'antd';
import router from 'umi/router';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Mutation } from 'react-apollo';
import { FormattedMessage } from 'umi-plugin-react/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ImagesUploader from '@/components/ImagesUploader';

const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create()
class WorkOrderCreator extends PureComponent {
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
      <PageHeaderWrapper title="发起工单">
        <Card bordered={false}>
          <Mutation
            mutation={gql`
              mutation($title: String!, $content: String, $imageKeys: [String!]) {
                result: createWorkOrder(
                  input: { title: $title, content: $content, imageKeys: $imageKeys }
                ) {
                  workOrder {
                    id
                  }
                }
              }
            `}
          >
            {mutate => {
              const handleSubmit = e => {
                e.preventDefault();

                const { form } = this.props;

                form.validateFieldsAndScroll(async (err, values) => {
                  if (!err) {
                    try {
                      // TODO 跳到创建成功的工单详情页
                      // const result = await mutate({ variables: values });
                      await mutate({ variables: values });

                      message.success('工单发起成功');

                      router.push('/work-orders');
                    } catch (catchedError) {
                      //
                    }
                  }
                });
              };

              return (
                <Form onSubmit={handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
                  <FormItem {...formItemLayout} label="标题">
                    {getFieldDecorator('title', {
                      rules: [
                        {
                          required: true,
                          message: '请输入标题！',
                        },
                      ],
                    })(<Input placeholder="请输入标题" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="具体描述">
                    {getFieldDecorator('content')(
                      <TextArea style={{ minHeight: 32 }} placeholder="请输入具体描述" rows={4} />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="附件">
                    {getFieldDecorator('imagekeys')(<ImagesUploader />)}
                  </FormItem>
                  <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      <FormattedMessage id="form.submit" />
                    </Button>
                  </FormItem>
                </Form>
              );
            }}
          </Mutation>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WorkOrderCreator;
