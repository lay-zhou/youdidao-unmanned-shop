import {
  Card,
  List,
  Button,
  Spin,
  Avatar,
  Pagination,
  Input,
  Modal,
  message,
} from 'antd';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Query, Mutation } from 'react-apollo';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './Coupons.less';

const { Search } = Input;

class ItemList extends PureComponent {
  state = {
    pages:10,
    cur:1,
    searchName: '',
  };

  handleSearch = e => {
    this.setState({
      searchName: e,
    });
  };

  render() {
    const { cur, pages, searchName } = this.state;

    // 截取路由
    const urlParams = new URL(window.location.href);
    const { hash } = urlParams;
    const projectId = hash.split('ProjectItem/')[1];

    const jump = () => {
      router.push(`/Coupons/Project/AddItem/${projectId}`);
    };

    const changePage = (page, pageSize) => {
      this.setState({
        cur: page,
        pages: pageSize,
      })
    };

    const ListContent = ({ data: { name, originalPrice, price, type, status } }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>名称</p>
          <p>{name}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>原价</p>
          <p>{Number(originalPrice) / 100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>价格</p>
          <p>{Number(price) / 100}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>类型</p>
          <p>{type === 'special' ? '不可退款' : '可退款'}</p>
        </div>
        <div className={styles.listContentItem}>
          <p>状态</p>
          <p>{status === 'published' ? '已上架' : '未上架'}</p>
        </div>
      </div>
    );

    const extraContent = (
      <div>
        <Search
          placeholder="请输入"
          onSearch={value => this.handleSearch(value)}
        />
      </div>
    ); 

    return (
      <Query
        query={gql`
          query(
            $projectId: ID,
            $pageSize: Int,
            $currentPage: Int,
            $status: Status,
            $nameLike: String,
          ){
            items(
              projectId: $projectId,
              pageSize: $pageSize,
              currentPage: $currentPage,
              status: $status,
              nameLike: $nameLike,
            ) {
              list {
                code
                name
                content
                originalPrice
                price
                unit
                imageUrl
                stock
                type
                status
              }
              pagination{
                pageSize
                total
                current
              }
            }
          }
        `}
        variables={{ pageSize: pages, currentPage: cur, status: 'published', projectId, nameLike: searchName }}
      >
        {({ loading, data: { items }, refetch }) => {
          if (loading) return <Spin />;
          refetch();
          // console.log('data projects', projects);

          const { pagination, list } = items;

            return (
              <Mutation
                mutation={gql`
                  mutation(
                    $itemCode: ID!
                    $projectId: ID
                    $type: UpdateItemToProjectType
                  ) {
                    updateItemToProject(
                      input: {
                        # 商品ID
                        itemCode: $itemCode
                        # 专题ID
                        projectId: $projectId
                        # 类型
                        type: $type
                      }
                    ) 
                  }
                `}
              >
                {mutate => {
                  const addItem = itemCode => {
                    const itemData = {};
                      itemData.itemCode = itemCode;
                      itemData.projectId = projectId;
                      itemData.type = 'remove';
                      try {
                        const promise = new Promise(resolve => {
                          console.log('itemData', itemData);
                          resolve(mutate({ variables: itemData }));
                        });
                        promise.then(value => {
                          console.log(value);
                          message.success('移除成功');
                          refetch();
                        });
                      } catch (catchedError) {
                        //
                      }
                  };
                  return (
                    <PageHeaderWrapper>
                      <Card
                        bordered={false}
                        className={styles.listCard}
                        title="专题商品"
                        style={{ marginTop: 24 }}
                        extra={extraContent}
                      >
                        <div className={styles.standardList}>
                          <Button
                            type="dashed"
                            style={{ width: '100%', marginBottom: 8 }}
                            icon="plus"
                            onClick={() => jump()}
                          >
                            添加
                          </Button>
                          <List
                            size="large"
                            rowKey="code"
                            loading={loading}
                            dataSource={list}
                            renderItem={item => (
                              <List.Item
                                actions={[
                                  <a
                                    onClick={() => {
                                      Modal.confirm({
                                        title: '移除商品',
                                        content: '确定移除该商品吗？',
                                        okText: '确认',
                                        cancelText: '取消',
                                        onOk: () => addItem(item.code),
                                      });
                                    }}
                                  >
                                    移除
                                  </a>,
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar src={item.imageUrl} shape="square" size="large" />
                                  }
                                  title={`[${item.code}]${item.name}`}
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
                        </div>
                      </Card>
                    </PageHeaderWrapper>
                  );
                }}
              </Mutation> 
            );
        }}
      </Query>
    );
  }
}
export default ItemList;
