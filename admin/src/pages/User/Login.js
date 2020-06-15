import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Alert, Form, Input, Icon, Button, Row, Col, message } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styles from './Login.less';

const MyCaptcha = Form.create()(props => {
  const { phone, form, classvalue, count, runGetCaptchaCountDown } = props;

  const backvalue = value => {
    classvalue(value.target.value);
  };

  return (
    <Mutation
      mutation={gql`
        mutation($phone: String!) {
          sendSmsCode(phone: $phone)
        }
      `}
      variables={{ phone }}
    >
      {mutate => {
        const onGetCaptcha = () => {
          const data = {};
          if (phone) {
            data.phone = phone;
            runGetCaptchaCountDown();
          } else {
            message.error('请输入手机号');
            return;
          }
          try {
            const promise = new Promise(resolve => {
              resolve(mutate({ variables: data.phone }));
            });
            promise.then(value => {
              console.log(value);
            });
          } catch (catchedError) {
            //
          }
        };
        return (
          <Form.Item>
            <Row gutter={8}>
              <Col span={16}>
                {form.getFieldDecorator('captcha', {
                  rules: [{ required: true, message: '请输入验证码' }],
                })(
                  <Input
                    prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    type="captcha"
                    placeholder="验证码"
                    style={{ height: 40 }}
                    onChange={event => {
                      backvalue(event);
                    }}
                  />
                )}
              </Col>
              <Col span={8}>
                <Button
                  disabled={count}
                  className={styles.getCaptcha}
                  size="large"
                  onClick={() => {
                    onGetCaptcha();
                  }}
                >
                  {count ? `${count} 秒` : '获取验证码'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        );
      }}
    </Mutation>
  );
});

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
@Form.create()
class LoginPage extends PureComponent {
  state = {
    type: 'mobile',
    phone: '',
    classvalue: '',
    count: '',
  };

  runGetCaptchaCountDown = () => {
    let count = 120 || 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    }
  };

  faclassvalue = cvalue => {
    this.setState({
      classvalue: cvalue,
    });
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { phone, classvalue, count } = this.state;

    const {
      form: { getFieldDecorator },
    } = this.props;

    const { dispatch } = this.props;

    const getphone = event => {
      this.setState({
        phone: event.target.value,
      });
    };

    return (
      <Mutation
        mutation={gql`
          mutation($phone: String!, $code: String!) {
            loginResult: loginWithPhoneAndSmsCodeByLogin(phone: $phone, code: $code) {
              clientMutationId
              token: accessToken
              role: role
            }
          }
        `}
      >
        {(mutate, { loading, error }) => {
          let errorMessage;
          
          if (error) {
            if (error.graphQLErrors[0].message) {
              errorMessage = error.graphQLErrors[0].message;
            }
          }

          const handleSubmit = e => {
            const { form } = this.props;

            e.preventDefault();
            form.validateFields(async (err, fieldsValue) => {
              if (!err) {
                const { mobile } = fieldsValue;

                try {
                  const result = await mutate({ variables: { phone: mobile, code: classvalue } });
                  localStorage.setItem('accessToken', result.data.loginResult.token);
                  // console.log('accessToken',result.data.loginResult.token);

                  switch (result.data.loginResult.role) {
                    case 'admin':
                      localStorage.setItem('role', 'admin/管理员');
                      break;
                    case 'facilitator':
                      localStorage.setItem('role', 'facilitator/服务商');
                      break;
                    case 'financial':
                      localStorage.setItem('role', 'financial/财务');
                      break;
                    case 'merchant':
                      localStorage.setItem('role', 'merchant/商户');
                      break;
                    case 'keep':
                      localStorage.setItem('role', 'keep/商户管理员');
                      break;
                    case 'advertising':
                      localStorage.setItem('role', 'advertising/广告管理员');
                      break;
                    case 'commodity':
                      localStorage.setItem('role', 'commodity/商品管理员');
                      break;
                    case 'member':
                      localStorage.setItem('role', 'member/会员');
                      break;
                    case 'user':
                      message.error('用户无权限登录！');
                      return;
                    default:
                      break;
                  }
                  dispatch({
                    type: 'login/loginSuccessfully',
                    payload: result.data.loginResult.role,
                  });
                } catch (catchedError) {
                  //
                }
              }
            });
          };
          return (
            <div className={styles.main}>
              {!!error && !loading && this.renderMessage(errorMessage)}
              <Form
                onSubmit={handleSubmit}
                className="login-form"
              >
                <Form.Item>
                  {getFieldDecorator('mobile', {
                    rules: [
                      {
                        required: true,
                        message: '请输入正确的手机号码',
                        pattern: /^1[3456789]\d{9}$/,
                      },
                    ],
                  })(
                    <Input
                      prefix={<Icon type="mobile" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder="手机号"
                      style={{ height: 40 }}
                      onChange={event => getphone(event)}
                    />
                  )}
                </Form.Item>
                <MyCaptcha
                  phone={phone}
                  classvalue={cvalue => this.faclassvalue(cvalue)}
                  count={count}
                  runGetCaptchaCountDown={this.runGetCaptchaCountDown}
                />
                <Form.Item style={{ marginTop: 32, textAlign: 'center' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    onClick={handleSubmit}
                    className={styles.getCaptcha}
                  >
                    <FormattedMessage id="app.login.login" />
                  </Button>
                </Form.Item>
              </Form>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default LoginPage;
