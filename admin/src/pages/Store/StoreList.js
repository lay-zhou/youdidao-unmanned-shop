import { 
  Card, 
  List, 
  Spin, 
  message, 
  Modal, 
  Avatar, 
  Pagination, 
  Form,
  Input,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './index.less';

const { Search } = Input;

const UpdateCategory = Form.create()(props => {
  const { UpdatemodalVisible, form, UpdatahandleModalVisible, data } = props;
  
  const updateId = data ? data.id : null;

  return (
    <Mutation
      mutation={gql`
        mutation(
          $id: ID!
          $status: StoreStatus!
        ) {
          updateStoreStatus(
            input: {
              # 名称
              id: $id
              # 简介
              status: $status
            }
          ) 
        }
      `}
    >
      {mutate => {
        const handleSubmit = () => {
          const adddata = {};
          adddata.id = updateId;
          adddata.status = 'draft';
          try {
            const promise = new Promise(resolve => {
              console.log('adddata', adddata);
              resolve(mutate({ variables: adddata }));
            });
            promise.then(value => {
              console.log(value);
              message.success('下架成功');
              UpdatahandleModalVisible();
            });
          } catch (catchedError) {
            //
          }
        };
        return (
          <Modal
            destroyOnClose
            title="下架"
            visible={UpdatemodalVisible}
            onOk={() => {
              form.validateFields((err, fieldsValue) => {
                if (err) return;
                handleSubmit(fieldsValue);
              });
            }}
            onCancel={() => UpdatahandleModalVisible()}
          >
            <p>请确定是否下架！！！</p>
          </Modal>
        );
      }}
    </Mutation>
  );
});

class StoreList extends PureComponent {
  state = {
    pages:10,
    cur:1,
  };

  UpdatahandleModalVisible = flag => {
    this.setState({
      UpdatemodalVisible: !!flag,
    });
  };

  getList = e => {
    this.setState({
      getListItem: e,
    });
  };

  // handleSearch = e => {
  //   this.setState({
  //       storeName: e,
  //   });
  // };

  render() {
    const { cur, pages, UpdatemodalVisible, getListItem } = this.state;

    const UpdataparentMethods = {
      UpdatahandleModalVisible: this.UpdatahandleModalVisible,
    };

    const changePage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    }

    const jump = (storeId) => {
      router.push(`/Store/StoreList/StoreDetail/${storeId}`);
    }

    const extraContent = (
      <div>
        <Search
          placeholder="请输入"
          onSearch={value => this.handleSearch(value)}
        />
      </div>
    ); 

    return(
      <Query
        query={gql`
          query(
            $status: Status, 
            $pageSize: Int, 
            $currentPage: Int
          ){
            stores(
              status: $status, 
              pageSize: $pageSize, 
              currentPage: $currentPage
            ){
              list{
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
              pagination {
                pageSize
                total
                current
              }
            }
          }
        `}
        variables={{ pageSize: pages, currentPage: cur, status: 'published' }}
      >
        {({ loading, data: { stores }, refetch }) => {
          if (loading) return <Spin />;
          refetch();
          console.log('stores', stores);
          const { pagination } = stores;
          const ListContent = ({ data: { name, address, longitude, latitude, balance } }) => (
            <div className={styles.listContent}>
              <div className={styles.listContentItem}>
                <p>名称</p>
                <p>{name}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>地址</p>
                <p>{address}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>经度</p>
                <p>{longitude}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>纬度</p>
                <p>{latitude}</p>
              </div>
              <div className={styles.listContentItem}>
                <p>营业额</p>
                <p>{balance/100}</p>
              </div>
            </div>
          );

          return (
            <PageHeaderWrapper>
              <div className={styles.standardList}>
                <Card
                  bordered={false}
                  className={styles.listCard}
                  title="店铺列表"  
                  style={{ marginTop: 24 }}
                  bodyStyle={{ padding: '0 32px 40px 32px' }}
                  extra={extraContent}
                >
                  <List
                    size="large"
                    rowKey="id"
                    loading={loading}
                    dataSource={stores && stores.list ? stores.list : []}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <a
                            onClick={() => {
                              this.UpdatahandleModalVisible(true);
                              this.getList(item);
                            }}
                          >
                            下架
                          </a>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.imageUrl} shape="square" size="large" />}
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
                    onChange={changePage}
                  />
                  <UpdateCategory
                    {...UpdataparentMethods}
                    data={getListItem}
                    UpdatemodalVisible={UpdatemodalVisible}
                    refetch={refetch}
                  />
                </Card>
              </div>
            </PageHeaderWrapper>
          );
        }}
      </Query>
    )
  }
}

export default StoreList;
