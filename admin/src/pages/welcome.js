import React from 'react';
import { Card, Icon } from 'antd';
import Result from '@/components/Result';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

export default () => (
  <PageHeaderWrapper>
    <Card bordered={false}>
      <Result
        description={
          <div>
            <Icon type="desktop" style={{ fontSize: '200px', color: '#08c' }} />
            <h1 style={{ fontSize: '35px', color: 'balack', margin: 30 }}>欢迎使用</h1>
            <p style={{ fontSize: '20px' }}>萌猫产品管理后台</p>
          </div>
        }
        style={{ marginTop: 48, marginBottom: 16 }}
      />
    </Card>
  </PageHeaderWrapper>
);
