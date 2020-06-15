import {
  Card,
  Spin,
  List,
  Pagination,
  Modal,
  message,
  Form,
  Input,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
// import moment from 'moment';
import router from 'umi/router';
import styles from './index.less';

const FormItem = Form.Item;

const UpdateStatus = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, refetch, formLayout, data } = props;

  return (
    <Mutation
      mutation={gql`
        mutation($id: ID!,$name:String,$phone:String){
          updateOrderStatus(id: $id,name: $name, phone: $phone)
        }
      `}
    >
      {mutate=>{
        const updateData = {};
        const updateStatus = e => {
          if (e) {
            if (e) {
              updateData.id = data.id;
            }else{
              updateData.id = data.id;
              updateData.name = e.name;
              updateData.phone = e.phone;
            }
            try {
              const promise = new Promise(resolve => {
                
                resolve(mutate({ variables: updateData }));
              });
              promise.then(value => {
                console.log(value);
                message.success('备货成功');
                refetch();
              });
            } catch (catchedError) {
              //
            }
          }
        };
        return(
          <Modal
            destroyOnClose
            title="备货"
            visible={UpdatemodalVisible}
            onOk={() => {
              form.validateFields((err, fieldsValue) => {
                if (err) return;
                updateStatus(fieldsValue);
              });
            }}
            onCancel={() => UpdatahandleModalVisible()}
          >
            <div>
              {
                data && data.type==='distribution'?(
                  <Form>
                    <FormItem {...formLayout} label="配送员名称">
                      {form.getFieldDecorator('name', {
                        rules: [
                          {
                            require: false,
                            message: '请填写配送员名称',
                          },
                        ],
                      })(<Input placeholder='请填写配送员名称' />)}
                    </FormItem>
                    <FormItem {...formLayout} label="配送员电话">
                      {form.getFieldDecorator('phone', {
                        rules: [
                          {
                            require: false,
                            message: '请填写配送员电话',
                          },
                        ],
                      })(<Input placeholder='请填写配送员电话' />)}
                    </FormItem>
                  </Form>):(
                    <p>该订单为非配送类型</p>)
              }
            </div>
          </Modal>
        );
      }}
    </Mutation>
  );
});

class CreateItem extends PureComponent {
  state = {
    pages:10,
    cur:1,
  };

  handleAdd = () => {
    this.handleModalVisible();
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
    const { cur, pages, UpdatemodalVisible, getlistitem } = this.state;


    const ListContent = ({ data: { price, discount, amount, store, coupon } }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>店铺名称</p>
          <p>{store.name}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>价格</p>
          <p>{price/100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>优惠金额</p>
          <p>{discount / 100}</p>
        </div>
        {
          coupon?
            <div className={styles.listContentItem}>
              <p>优惠券金额</p>
              <p>{coupon.amount}</p>
            </div>
          :
          null
        }
        <div className={styles.listContentItem}>
          <p>总计</p>
          <p>{amount / 100}</p>
        </div>
        
      </div>
    );

    const Changepage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const jump = (orderId) => {
      router.push(`/OrderList/PrepareGoods/OrderDetail/${orderId}`);
    }

    const UpdataparentMethods = {
      UpdatahandleModalVisible: this.UpdatahandleModalVisible,
    };

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    return (
      <PageHeaderWrapper title="备货订单列表">
        <Card bordered={false}>
          <Query
            query={gql`
              query(
                $pageSize: Int,
                $currentPage: Int,
                $status: OrderStatus,
              ){
                orders(
                  input:{
                    pageSize: $pageSize,
                    currentPage: $currentPage,
                    status: $status,
                  }
                ) {
                  list{
                    id
                    price
                    discount
                    amount
                    status
                    type
                    orderItem{
                      id
                      imageUrl
                      title
                      price
                      amount
                      number
                    }
                    trade{
                      id
                      price
                      status
                    }
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
                    coupon{
                      id
                      amount
                      require
                      usedAt
                      expiredDate
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
            variables={{ pageSize: pages, currentPage: cur, status:'paid' }}
          >
            {({ loading, data:{ orders }, refetch }) => {
              if (loading) return <Spin />;
              refetch();
              // console.log('orders',orders);
              
              const { pagination } = orders;

              return (
                <PageHeaderWrapper>
                  <div className={styles.standardList}>
                    <List
                      size="large"
                      rowKey="id"
                      loading={loading}
                      dataSource={orders && orders.list ? orders.list : []}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <a
                              onClick={() => {
                                this.UpdatahandleModalVisible(true);
                                this.Getlist(item);
                              }}
                            >
                              备货
                            </a>,
                            // <a
                            //   onClick={() => {
                            //     Modal.confirm({
                            //       title: '备货',
                            //       content: '确定备货吗？',
                            //       okText: '确认',
                            //       cancelText: '取消',
                            //       onOk: () => updateStatus(item.id),
                            //     });
                            //   }}
                            // >
                            //   备货
                            // </a>,
                          ]}
                        >
                          <List.Item.Meta
                            title={<a onClick={()=>jump(item.id)}>[{item.id}]{item.name}</a>}
                            description={item.content}
                          />
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
                    <UpdateStatus
                      {...UpdataparentMethods}
                      data={getlistitem}
                      UpdatemodalVisible={UpdatemodalVisible}
                      formLayout={formLayout}
                      refetch={refetch}
                    />
                  </div>
                </PageHeaderWrapper>
              );
            }}
          </Query>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CreateItem;
