import React, { Component } from 'react';
import {
  Input, message,
} from 'antd';

import router from 'umi/router';
import styles from './index.less';

class SearchList extends Component {
  state = {

  };

  handleFormSubmit = value => {
      if (value) {
        router.push(`/CheckOrder/CheckDetail/${value}`);
      } else {
        message.error('请输入订单ID');
      }
  }

  render() {

    

    return (
      <div className={styles.search} style={{ textAlign: 'center' }}>
        <Input.Search
          placeholder="请输入订单ID"
          enterButton="搜索"
          size="large"
          onSearch={this.handleFormSubmit}
          style={{ width: 522 }}
        />
      </div>
    );
  }
}

export default SearchList;
