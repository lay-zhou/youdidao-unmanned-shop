import { Input, Switch, message } from 'antd';
import React, { PureComponent } from 'react';
import Editor from 'wangeditor';
import htmlparser from 'htmlparser';

const { TextArea } = Input;

export default class HtmlEditor extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = props;
    const rawHtml = value;
    const handler = new htmlparser.DefaultHandler((error) => {
      if (error){
        message.error('...do something for errors...');
      }
      else{
        message.success('...parsing done, do something...');
      }
    });
    console.log('handler',handler);
    
    const parser = new htmlparser.Parser(handler);
    console.log('parser',parser);
    
    parser.parseComplete(rawHtml);
    // sys.puts(sys.inspect(handler.dom, false, null));
    console.log('handler.dom',handler.dom);

    // parser.parseChunk(chunk)
    this.state = {
      raw: false,
      value,
    };
  }

  componentDidMount() {
    this.editor = new Editor(this.editorElem);
    this.editor.customConfig.menus = ['head', 'bold', 'italic', 'underline'];
    this.editor.customConfig.onchange = html => {
      this.setState({ value: html });
      // const { onChange } = this.props;
      // onChange(html);
    };
    this.editor.create();
  }

  onSwitchChange = () => {
    const { raw } = this.state;
    this.setState({ raw: !raw });
  };

  onTextAreaChange = event => {
    const { value } = event.target;
    this.setState({ value });
    this.editor.txt.html(value);
    // const { onChange } = this.props;
    // onChange(value);
  };

  render() {
    const { raw, value } = this.state;
    


    return (
      <div>
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          value={raw}
          onChange={this.onSwitchChange}
        />
        {' HTML'}
        {raw ? 
          <TextArea value={value} rows={4} onChange={this.onTextAreaChange} /> 
          : null}
        <div
          ref={ref => {
            this.editorElem = ref;
          }}
        />
      </div>
    );
  }
}