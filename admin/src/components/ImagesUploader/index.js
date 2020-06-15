import { Icon, Modal, Upload, Spin } from 'antd';
import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';

export default class ImagesUploader extends React.Component {
  state = {
    previewVisible: false,
    previewImage: null,
    fileList: [],
    keys: [],
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleChange = (key, { fileList: newFileList, file }) => {
    const { onChange } = this.props;

    const { fileList, keys } = this.state;

    switch (file.status) {
      case 'done': {
        keys.push(key);
        break;
      }

      case 'removed': {
        const index = fileList.findIndex(value => value.uid === file.uid);
        keys.splice(index, 1);
        break;
      }

      default:
        break;
    }
    this.setState({ keys });
    onChange(keys);
    this.setState({ fileList: newFileList });
  };

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );
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
            if (loading) return <Spin />;
            const { key, host, OSSAccessKeyId, policy, signature } = data.params;
            return (
              <Upload
                action={host}
                listType="picture-card"
                fileList={fileList}
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
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            );
          }}
        </Query>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
