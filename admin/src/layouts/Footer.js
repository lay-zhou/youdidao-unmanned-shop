import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      links={[]}
      copyright={
        <Fragment>
          Copyright <Icon type="copyright" /> 2019 <a href="https://globecat.cn/">萌猫智科</a>技术支持
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;
