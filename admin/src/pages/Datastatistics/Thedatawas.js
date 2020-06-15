import React, { memo } from 'react';
import { Row, Col, Card, Tabs } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import numeral from 'numeral';

const { TabPane } = Tabs;

const rankingListData = [];
for (let i = 0; i < 7; i += 1) {
  rankingListData.push({
    title: formatMessage({ id: 'app.analysis.test' }, { no: i }),
    total: 323234,
  });
}

const SalesCard = memo(({ loading }) => (
  <Card loading={loading} bordered={false} bodyStyle={{ padding: 0 }}>
    <div>
      <Tabs size="large" tabBarStyle={{ marginBottom: 24 }}>
        <TabPane
          tab={<FormattedMessage id="app.analysis.Storesales" defaultMessage="门店销售排行" />}
          key="sales"
        >
          <Row>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
              <div>
                <h4 style={{ marginLeft: 125, height: 40 }}>
                  <FormattedMessage
                    id="app.analysis.sales-ranking"
                    defaultMessage="Sales Ranking"
                  />
                </h4>
                <ul>
                  {rankingListData.map((item, i) => (
                    <li key={item.title} style={{ height: 40 }}>
                      <span style={{ marginLeft: 185 }}>{i + 1}</span>
                      <span title={item.title} style={{ marginLeft: 20 }}>
                        {item.title}
                      </span>
                      <span style={{ marginLeft: 40 }}>{numeral(item.total).format('0,0')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        </TabPane>
        <TabPane
          tab={<FormattedMessage id="app.analysis.Commoditysales" defaultMessage="商品销售排行" />}
          key="views"
        >
          <Row>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
              <div>
                <h4 style={{ marginLeft: 125, height: 40 }}>
                  <FormattedMessage
                    id="app.analysis.Commoditysalesranking"
                    defaultMessage="商品销售额排名"
                  />
                </h4>
                <ul>
                  {rankingListData.map((item, i) => (
                    <li key={item.title} style={{ height: 40 }}>
                      <span style={{ marginLeft: 185 }}>{i + 1}</span>
                      <span title={item.title} style={{ marginLeft: 20 }}>
                        {item.title}
                      </span>
                      <span style={{ marginLeft: 40 }}>{numeral(item.total).format('0,0')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  </Card>
));

export default SalesCard;
