import React, { PureComponent } from 'react';
import Editor from 'wangeditor';

export default class ArticleEditor extends PureComponent {
  componentDidMount() {
    const editor = new Editor('#editor');
    // 自定义菜单配置
    editor.customConfig.menus = [
      'head',
      'bold',
      'italic',
      'underline',
      'image',
      'video',
      'link',
      'foreColor',
      'backColor',
      'fontSize',
      'fontName',
      'justify',
    ];
    editor.customConfig.onchange = html => {
      const { onChange } = this.props;
      onChange(html);
    };
    editor.customConfig.uploadImgShowBase64 = true;
    editor.create();
  }

  render() {
    return <div id="editor" style={{ width: '100%', zIndex: '1' }} />;
  }
}