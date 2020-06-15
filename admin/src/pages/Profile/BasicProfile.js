import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

const { Description } = DescriptionList;

@connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))
class BasicProfile extends Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    const { params } = match;

    dispatch({
      type: 'profile/fetchBasic',
      payload: params.id || '10000',
    });
  }

  render() {
    const { profile = {}, loading } = this.props;
    const { userInfo = {}, application = {} } = profile;

    return (
      <PageHeaderWrapper title="订单详情" loading={loading}>
        <Card bordered={false}>
          <DescriptionList size="large" title="订单信息" style={{ marginBottom: 32 }}>
            <Description term="取货单号">{application.id}</Description>
            <Description term="状态">{application.status}</Description>
            <Description term="销售单号">{application.orderNo}</Description>
            <Description term="子订单">{application.childOrderNo}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
          <DescriptionList size="large" title="用户信息" style={{ marginBottom: 32 }}>
            <Description term="用户姓名">{userInfo.name}</Description>
            <Description term="联系电话">{userInfo.tel}</Description>
            <Description term="常用快递">{userInfo.delivery}</Description>
            <Description term="取货地址">{userInfo.addr}</Description>
            <Description term="备注">{userInfo.remark}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BasicProfile;
