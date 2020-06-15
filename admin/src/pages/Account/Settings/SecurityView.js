import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Card, Button } from 'antd';
import styles from './SecurityView.less';

const FormItem = Form.Item;
const { TextArea } = Input;
@Form.create()
class SecurityView extends PureComponent {
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
        sm: { span: 10, offset: 5 },
      },
    };

    return (
      <Card bordered={false}>
        <p>地址：合肥瑶海都市科技工业园2＃楼D座101室</p>
        <p>联系电话：166 5516 0366</p>
        <p>邮箱：he1166@qq.com</p>
        <Form className={styles.title} style={{ marginTop: 8 }} onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="标题">
            {getFieldDecorator('title', {})(<Input placeholder="标题" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="留言">
            {getFieldDecorator('content', {})(
              <TextArea style={{ minHeight: 32 }} placeholder="留言" rows={4} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="邮箱">
            {getFieldDecorator('groupName', {})(<Input placeholder="电子邮箱" />)}
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              <FormattedMessage id="form.submit" />
            </Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}

export default SecurityView;
