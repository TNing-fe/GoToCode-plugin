/*
 * @Author: xiezhaoxu
 * @Date: 2022-08-29 17:28:36
 * @LastEditTime: 2022-08-29 17:40:58
 * @Description: 跳转到VSCode对应的具体代码行 调用code -r -g fileName:line 命令
 */
const child_process = require('child_process')

module.exports = ({ router, options }) => {
  router.get('/api/herd/go-to-code', async (ctx) => {
    const query = ctx.request.query;
    const { codeLocation } = query;
    if (codeLocation) {
      // 调用VSCode的命令，跳转到具体对应的代码行
      child_process.exec(`code -r -g ${codeLocation}`)
    }
    ctx.body = {
      success: true,
      data: {data: true},
    }
  });
};