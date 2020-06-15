import { Upload, Spin, Button, Modal, Icon } from 'antd';
import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';

export default class FileUploader extends React.Component {
  state = {
    previewVisible: false,
    key: '',
  };

  handleChange = (newKey, { fileList: newFileList, file }) => {
    console.log('handleChange newKey', newKey);
    console.log('handleChange this', newFileList);
    console.log('handleChange this', file);
    const { onChange } = this.props;
    const { key } = this.state;
    onChange(key);
    this.setState({ key: newKey });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = () => {
    this.setState({
      previewVisible: true,
    });
  };

  render() {
    const { previewVisible } = this.state;
    return (
      <div className="clearfix">
        <Query
          query={gql`
            {
              params: uploadParams {
                key
                OSSAccessKeyId: accessid
                host
                policy
                signature
                expire
              }
            }
          `}
        >
          {({ loading, data, refetch }) => {
            console.log();
            if (loading) return <Spin />;
            const { key, host, OSSAccessKeyId, policy, signature } = data.params;
            return (
              <Upload
                action={host}
                beforeUpload={() => refetch()}
                data={{
                  key,
                  policy,
                  OSSAccessKeyId,
                  signature,
                }}
                onPreview={this.handlePreview}
                onChange={this.handleChange.bind(this, key)} // eslint-disable-line
              >
                <Button>
                  <Icon type="upload" />
                </Button>
              </Upload>
            );
          }}
        </Query>
        <Modal visible={previewVisible} />
      </div>
    );
  }
}
