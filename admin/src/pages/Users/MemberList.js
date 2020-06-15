import {
  Card,
  List,
  Avatar,
  Form,
  Input,
  Modal,
  message,
  Select,
  Spin,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
// import router from 'umi/router';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
// import {hashHistory} from 'react-router';
import router from 'umi/router';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;

const UpdateCategory = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, formLayout, data } = props;

  const refreshId = data ? data.id : null;

  return (
    <Mutation
      mutation={gql`
        mutation( $id:ID!, $role:Role ){
          updateUserRole( id: $id, role: $role ) 
        }
      `}
      variables={{ id: refreshId }}
    >
      {mutate => {
        const handleSubmit = e => {
          const refreshdata ={};
          if (e) {
            // 这里的e不携带任何有效参数
            if (e.id) refreshdata.id = e.id;
            if (e.role) refreshdata.role = e.role;
            try {
              const promise = new Promise(resolve => {
                // console.log('refreshdata',refreshdata);
                
                resolve(mutate({ variables: refreshdata }));
              });
              promise.then(value => {
                console.log(value);
                message.success('修改成功');
                // refetch();
                UpdatahandleModalVisible()
              });
            } catch (catchedError) {
              //
            }
          }
        };
        return (
          <Modal
            destroyOnClose
            title="修改用户类型"
            visible={UpdatemodalVisible}
            onOk={() => {
              form.validateFields((err, fieldsValue) => {
                if (err) return;
                handleSubmit(fieldsValue);
              });
            }}
            onCancel={() => UpdatahandleModalVisible()}
          >
            <div>
              <FormItem {...formLayout} label="ID">
                {form.getFieldDecorator('id', {
                  initialValue: data ? data.id : null,
                  rules: [
                    {
                      require: false,
                    },
                  ],
                })(<Input disabled />)}
              </FormItem>
              <FormItem {...formLayout} label="类型">
                {form.getFieldDecorator('role', {
                  rules: [
                    {
                      require: false,
                      message: '请选择类型',
                    },
                  ],
                })(
                  <Select style={{ width: 260 }} placeholder='请选择用户类型'>
                    <Option key="user" value="user">
                      普通用户
                    </Option>
                    <Option key="vip" value="vip">
                      会员用户
                    </Option>
                    <Option key="member" value="member">
                      分销用户
                    </Option>
                  </Select>
                )}
              </FormItem>
            </div>
          </Modal>
        );
      }}
    </Mutation>
  );
});

class UserList extends PureComponent {
  state = {};

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  UpdatahandleModalVisible = flag => {
    this.setState({
      UpdatemodalVisible: !!flag,
    });
  };

  Getlist = e => {
    this.setState({
      getlistitem: e,
    });
  };

  render() {
    const { UpdatemodalVisible, deleteId, getlistitem } = this.state;

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    const UpdataparentMethods = {
      UpdatahandleModalVisible: this.UpdatahandleModalVisible,
    };

    const jump = (userId) => {
      router.push(`/Users/MemberList/OrderList/${userId}`);
    }

    const ListContent = ({ data: { phone, point, balance, role } }) => (
      <div className={styles.listContent}>
        {
          phone?(
            <div className={styles.listContentItem}>
              <p>手机号码</p>
              <p>{phone.number}</p>
            </div>
          ):null
        }
        <div className={styles.listContentItem}>
          <p>积分</p>
          <p>{point}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>余额</p>
          <p>{balance/100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>用户类别</p>
          <p>{role==='vip'?'会员用户':'普通用户'}</p>
        </div>
      </div>
    );

    return (
      <PageHeaderWrapper title="会员用户">
        <Card bordered={false}>
          <Query
            query={gql`
                query($pageSize:Int, $currentPage:Int){
                    users(input: {
                        role: vip
                        pageSize: $pageSize
                        currentPage: $currentPage
                    }){
                        list{
                          id
                          role
                          point
                          balance
                          memberExpiredDate
                          phone{
                          number
                          }
                          wechat{
                            nickname
                            avatarUrl
                          }
                        }
                        pagination{
                          pageSize
                          total
                          current
                        }
                      }
                    }
              `}
          >
            {({ loading, data: { users }, refetch }) => {
              if (loading) return <Spin />;
              refetch();
              console.log('users', users);

              return (
                <div className={styles.standardList}>
                  <List
                    size="large"
                    rowKey="id"
                    loading={loading}
                    dataSource={users && users.list ? users.list : []}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <a
                            onClick={() => {
                              this.UpdatahandleModalVisible(true);
                              this.Getlist(item);
                            }}
                          >
                            修改
                          </a>,
                          <a
                            onClick={() => jump(item.id)}
                          >
                            查看用户订单
                          </a>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.wechat.avatarUrl} shape="square" size="large" />}
                          title={`${item.wechat.nickname}`}
                        />
                        <ListContent data={item} />
                      </List.Item>
                    )}
                  />
                  <UpdateCategory
                    {...UpdataparentMethods}
                    data={getlistitem}
                    UpdatemodalVisible={UpdatemodalVisible}
                    formLayout={formLayout}
                    refetch={refetch}
                  />
                </div>

              );
            }}
          </Query>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default UserList;
