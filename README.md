# GoToCode-plugin
点击DOM元素跳转到对应的代码行

实际效果如下：
【图片】

### 引入方法
文件列表
【图片】

#### 入口文件添加injectGoToCode
在index.web.jsx文件中接入injectGoToCode
```javascript
// index.web.jsx
import { injectGoToCode } from 'plugin/go-to-code-plugin/inject/index';

export function start() {
  ...
  ...
  AppRegistry.registerComponent('TmallMobile', () => App);
  AppRegistry.runApplication('TmallMobile', {
    rootTag: document.getElementById('container'),
    
  });
  // 只在开发环境生效
  if (process.env.NODE_ENV === 'development') {
    injectGoToCode();
  }
  ...
  ...
}

```
#### 引入babel-plugin-add-code-line插件
在loader/babel.js中引入babel-plugin-add-code-line插件，注意要先引入plugin-transform-react-jsx对jsx语法进行解析：
```javascript
// loader/babel.js
// 只针对本机开发环境
if (isDevelopment) {
  // 需要先引入@babel/plugin-transform-react-jsx
  plugins.push('@babel/plugin-transform-react-jsx');
  // 注意路径
  plugins.push([
    './src/plugin/go-to-code-plugin/babel-plugin/babel-plugin-add-code-line.ts',
    {
      elementTypes: ['View', 'Text', 'FormatFee', 'FormattedMessage'],
      excludePaths: ['node_modules', 'utils/react-intl/index.tsx'],
    },
  ]);
}
```
#### Server添加接口处理
在server添加goToCode的接口处理
```javascript
// server/router/index.js

const goToCode = require('../../src/plugin/go-to-code-plugin/server/go-to-code');

module.exports = function (arg) {
  ...
  ...
  goToCode(arg);
}
```
添加VSCode命令行，command+shift+p 输入PATH，选择 '在PATH中安装"code"命令'
【图片】

### 关于属性名的问题
属性值要以data-*开头，原因是View最终渲染成div，是借助react-native-web，我们通过react-native-web的源码，可以看到View不是支持所有的属性值，只支持特定的属性值及aria-和data-开头的属性值才会被添加到div节点上。同时data-*本身就是为了提供所有 HTML 元素上嵌入自定义数据属性的能力。
⚠️  需要注意的是不同的react-native-web对data-*属性的处理是不同的，比较坑
react-native-web@0.12.0之前版本：/src/exports/View/filterSupportedProps.js 查看支持的属性名：
【图片】
react-native-web@0.13.0以后：src/modules/modules/forwardedProp/index.js
【图片】
所以添加属性值是有点区别的：
```javascript
// react-native-web@0.13.x 之后版本
dataSet: { 'source-map': `${filename}:${line}` }

// react-native-web@0.12.x 之前版本
'data-source-map': `${filename}:${line}`
```
### 关于颗粒度的问题
如果只选取View、Text作为添加代码行属性的节点类型的话，我们会发现对应有些组件会有如下问题：
比如使用国际化组件**FormattedMessage**渲染文案的地方，由于**FormattedMessage**最终会渲染为**Text**组件，所以导致点击对应文案都会跳转到**FormattedMessage**源码处，违背了这个工具的初衷。所以babel-plugin-add-code-line添加了两个option来避免这个问题：
**elementTypes: string**[]   需要添加代码行的节点类型列表 例：['View', 'Text', '**FormattedMessage'**]
**excludePaths: string[]     **需要屏蔽的文件路径(不需要全部路径)  例：['node_module', 'utils/react-intl']
上面提到的**FormattedMessage**的问题，只需要添加**FormattedMessage**到**elementTypes**，添加utils/react-intl到**excludePaths**即可。

### 其他

- 本工具是基于移动端的编写的，同时稍作修改也适用于PC端（点击事件名、Element类型设置为div/span等）。
- 由于react-native-view的Button组件不支持自定义属性(包括data-*)，所以目前无法给Button添加代码行属性，但可以通过Button的文案（使用Text或FormattedMessage）定位到具体代码。
- 不同的项目可以通过配置**elementTypes**和**excludePaths**去适配自己的项目

