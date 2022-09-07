/* eslint-disable @typescript-eslint/no-var-requires */
/*
 * @Author: xiezhaoxu
 * @Date: 2022-08-29 14:27:44
 * @LastEditTime: 2022-08-31 11:02:10
 * @Description: Babel插件，给DOM节点添加data-source-map，赋值具体代码行
 */
const types = require('@babel/types');
const parser = require('@babel/parser');
const _ = require('lodash');

// 处理的Element类型
// const ELEMENT_TYPES = [
//   'View', 'FormattedMessage', 'Button', 'Text', 'FormatFee',
// ]

// 过滤文件或文件 'node_modules' 'utils/react-intl'
// ELEMENT_TYPES 添加了FormattedMessage，所以过滤掉utils/react-intl下的FormattedMessage
// ELEMENT_TYPES 添加了FormatFee，所以过滤common/format-fee下FormatFee
// const REG_EXCLUDE_FILE = /(node_modules)|(utils\/react-intl)|(common\/format-fee)/

module.exports = () => {
  return {
    visitor: {
      CallExpression(path, state) {
        const { callee, loc: { start: { line = 0 } = {} } = {} } = path.node;
        const {
          filename,
          opts: { elementTypes, excludePaths },
        } = state;
        const REG_EXCLUDE_FILE = new RegExp(`${excludePaths.map(item => `(${item})`).join('|')}`);

        // 过滤文件
        if (REG_EXCLUDE_FILE.test(filename)) return;
        // 判断是否为React.createElement函数表达是
        if (callee.object?.name === 'React' && callee.property?.name === 'createElement') {
          // 取path.node.arguments[0] path.node.arguments[1]
          const [element, propsExpression] = path.node.arguments || [];
          let elementType = '';
          if (types.isStringLiteral(element)) {
            elementType = element.value;
          } else if (types.isIdentifier(element)) {
            elementType = element.name;
          }

          // 判断节点类型 是否为elementTypes
          if (elementTypes.includes(elementType)) {
            let stringLiteral = JSON.stringify({
              // react-native-web@0.13.x 之后版本
              dataSet: { 'source-map': `${filename}:${line}` },
              // react-native-web@0.12.x 之前版本
              'data-source-map': `${filename}:${line}`,
            });

            let extraPropsExpression = parser.parseExpression(stringLiteral);
            if (types.isNullLiteral(propsExpression)) {
              // eslint-disable-next-line no-param-reassign
              path.node.arguments[1] = extraPropsExpression;
            } else if (types.isObjectExpression(propsExpression)) {
              // CallExpression会重复调用 所以如果已经增加过data-source-map就不需要再添加
              const isAdded = _.find(propsExpression.properties, (item) => {
                return item?.key?.value === 'data-source-map';
              });
              if (!isAdded) {
                // eslint-disable-next-line no-param-reassign
                path.node.arguments[1] = types.objectExpression(
                  propsExpression.properties.concat(extraPropsExpression.properties)
                );
              }
            }
          }
        }
      },
    },
  };
};
