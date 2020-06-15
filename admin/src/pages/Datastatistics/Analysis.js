import React, { Component, Suspense } from 'react';
import { Row, Col, Icon, Menu, Dropdown } from 'antd';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import styles from './Analysis.less';
import PageLoading from '@/components/PageLoading';

const IntroduceRow = React.lazy(() => import('./Severalseries'));
const RankingStore = React.lazy(() => import('./RankingStore'));
const RankingGoods = React.lazy(() => import('./RankingGoods'));

class Analysis extends Component {
  state = {};

  render() {

    const menu = (
      <Menu>
        <Menu.Item>操作一</Menu.Item>
        <Menu.Item>操作二</Menu.Item>
      </Menu>
    );

    const dropdownGroup = (
      <span className={styles.iconGroup}>
        <Dropdown overlay={menu} placement="bottomRight">
          <Icon type="ellipsis" />
        </Dropdown>
      </span>
    );

    return (
      <GridContent>
        <Suspense fallback={<PageLoading />}>
          <IntroduceRow />
        </Suspense>
        <div className={styles.twoColLayout}>
          <Row gutter={24}>
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Suspense fallback={null}>
                <RankingStore dropdownGroup={dropdownGroup} />
              </Suspense>
            </Col>
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Suspense fallback={null}>
                <RankingGoods dropdownGroup={dropdownGroup} />
              </Suspense>
            </Col>
          </Row>
        </div>
        
      </GridContent>
    );
  }
}

export default Analysis;
