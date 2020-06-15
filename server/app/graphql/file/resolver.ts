export const Query = {
    // 上传参数
    async uploadParams(_root, _params, { service }) {
      return service.file.generateUploadParams();
    },
  };
  