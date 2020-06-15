import { Card, Spin, Form, message, Modal, Input, List, Button, Pagination } from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const { Search } = Input;

const Audit = Form.create()(props => {
    const { modalVisible, form, handleModalVisible, refetch, data } = props;

    console.log('data',data);
    
    return (
      <Mutation
        mutation={gql`
          mutation($id: ID!) {
            audit(id: $id)
          }
        `}
      >
        {mutate => {
          const handleSubmit = e => {
            const auditData = {};
            if (e) {
              auditData.id = data.id;
              try {
                const promise = new Promise(resolve => {
                    // console.log('auditData',auditData);
                  resolve(mutate({ variables: auditData }));
                });
                promise.then(value => {
                  console.log(value);
                  message.success('打款成功');
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
              title="打款"
              visible={modalVisible}
              // onOk={() => {
              //   form.validateFields((err, fieldsValue) => {
              //     if (err) return;
              //     handleSubmit(fieldsValue);
              //   });
              // }}
              onCancel={() => handleModalVisible()}
              footer={[
                <Button 
                  key="submit" 
                  type="primary"
                  onClick={
                    () => {
                      form.validateFields((err) => {
                        if (err) return;
                        const audit = {};
                        audit.status = 'audit';
                        handleSubmit(audit);
                      });
                    }
                  }
                >
                  通过审核
                </Button>,
                <Button 
                  key="back"
                  onClick={() => handleModalVisible()}
                >
                  取消
                </Button>,
              ]}
            >
              {
                    data?
                      <div>
                        <p><span style={{ display:'inline-block', width:150, textAlign:'right',marginRight:10 }}>提现ID:</span>{data.id}</p>
                        <p><span style={{ display:'inline-block', width:150, textAlign:'right',marginRight:10 }}>提现人名称:</span>{data.name}</p>
                        <p><span style={{ display:'inline-block', width:150, textAlign:'right',marginRight:10 }}>提现号码:</span>{data.phone}</p>
                        <p><span style={{ display:'inline-block', width:150, textAlign:'right',marginRight:10 }}>提现账户:</span>{data.account}</p>
                        <p><span style={{ display:'inline-block', width:150, textAlign:'right',marginRight:10 }}>提现金额:</span>{data.price/100}</p>
                        <p><span style={{ display:'inline-block', width:150, textAlign:'right',marginRight:10 }}>提现卡号:</span>{data.card}</p>
                        {
                            data.remark?
                              <p><span style={{ display:'inline-block', width:150, textAlign:'right',marginRight:10 }}>备注:</span>{data.remark}</p>
                            :null
                        }
                      </div>
                    :null
                }
            </Modal>
          );
        }}
      </Mutation>
    );
  });

class StoreInfo extends PureComponent {

    state = {
        pages:10,
        cur:1,
      };

  handleModalVisible = (flag,props) => {
    this.setState({
      modalVisible: !!flag,
      audit: props,
    });
  };

  render() {

    const { modalVisible, audit, pages, cur } = this.state;

    const formLayout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 13 },
    };

    const Changepage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const parentMethods = {
        handleModalVisible: this.handleModalVisible,
    };

    const extraContent = (
      <div>
        <Search
          placeholder="请输入"
          onSearch={value => this.handleSearch(value)}
        />
      </div>
    );

    const ListContent = ({ data: { name, price, store, phone, account, card, remark} }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>姓名</p>
          <p>{name || 'null'}</p>
        </div>
        {
          store?
            <div className={styles.listContentItem}>
              <p>商店名称</p>
              <p>{store.name}</p>
            </div>
            :null
        }
        <div className={styles.listContentItem}>
          <p>提现金额</p>
          <p>{price/100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>号码</p>
          <p>{phone}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>提现卡号</p>
          <p>{card}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>提现账户</p>
          <p>{account}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>备注</p>
          <p>{remark}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>提现状态:</p>
          <p>未审核</p>
        </div>
      </div>
    );

    return (
      <PageHeaderWrapper>
        <Card bordered={false} title="待处理提现" extra={extraContent}>
          <Query
            query={gql`
                query(
                  $userId: ID, 
                  $status:WithdrawalType, 
                  $pageSize: Int, 
                  $currentPage:Int,
                  $type: WithType,
                  )
                {
                    withdrawals(
                        userId: $userId,
                        status: $status,
                        pageSize: $pageSize,
                        currentPage: $currentPage,
                        type: $type,
                    ){
                      list{
                        id
                        name
                        price
                        phone
                        account
                        card
                        remark
                        createdAt
                        updatedAt
                        status
                        type
                        user{
                          id
                          imageUrl
                          nickname
                          balance
                          point
                          role
                          phone
                        }
                        store{
                          id
                          name
                          distance
                          sales
                          balance
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
            variables={{ status: 'audit', pageSize: pages, currentPage: cur, type: 'store' }}
          >
            {({ loading, data: { withdrawals },refetch }) => {
                console.log('Query return withdrawals', withdrawals);
                if (loading) return <Spin />;
                const { pagination } = withdrawals;
                
                return (
                  <div className={styles.standardList}>
                    <List
                      size="large"
                      rowKey="id"
                      loading={loading}
                      dataSource={withdrawals && withdrawals.list ? withdrawals.list : []}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <a
                              onClick={() => this.handleModalVisible(true, item)}
                            >
                              审核
                            </a>,
                          ]}
                        >
                          <List.Item.Meta description={`ID: ${item.id}`} />
                          <ListContent data={item} />
                        </List.Item>
                      )}
                    />
                    <Pagination
                      current={pagination.current}
                      total={pagination.total}
                      style={{ float:"right" }}
                      onChange={Changepage}
                    />
                    <Audit
                      {...parentMethods}
                      data={audit}
                      modalVisible={modalVisible}
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

export default StoreInfo;
