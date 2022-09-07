/*
 * @Author: xiezhaoxu
 * @Date: 2022-08-29 15:09:20
 * @LastEditTime: 2022-08-31 10:56:03
 * @Description: 在页面添加command+点击事件，请求后端定位代码接口
 */

// 点击处理函数，获取该节点上的代码位置属性，请求后端跳转到代码行
const handleClick = (event: TouchEvent): boolean => {
  // ⌘ command按键是否按下
  if (event.metaKey) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (target?.getAttribute('data-source-map')) {
      // 📌 显示优化 非必要 Start
      target?.classList.add('source-map');
      target?.addEventListener('touchend', (_evt: TouchEvent) => {
        (_evt.target as HTMLElement)?.classList.remove('source-map');
        return false;
      });
      // 📌 显示优化 非必要 End
      const codeLocation = target?.getAttribute('data-source-map');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `/api/herd/go-to-code?codeLocation=${codeLocation}`);
      xhr.send(null);
    }
    return false;
  }
  return true;
};

export function injectGoToCode() {
  // ⚠️ 这边需要把点击事件帮到到 document.body或root节点下第一个字节点上。
  //    由于React V16.x.x的事件系统是把所有点击事件统一绑定到document
  //    如果我们也把这个点击事件绑定到document上的话，是无法阻止该事件冒泡的

  // React V16.x.x可以直接绑定到body上
  // document.body.addEventListener('touchstart', handleClick);
  // document.body.addEventListener('click', handleClick);

  // React V17.x.x绑定到root节点下第一个字节点上
  document.getElementById('container').firstChild.addEventListener('touchstart', handleClick);
  document.getElementById('container').firstChild.addEventListener('click', handleClick);

  // 📌 显示优化 非必要 Start
  const styleElement: HTMLStyleElement = document.createElement('style');
  styleElement.innerHTML = `.source-map {background: blue !important; opacity: 0.5 !important;}`;

  document.onkeydown = (evt: KeyboardEvent) => {
    // ⌘ command按键
    if (
      evt.keyCode === 91 ||
      evt.keyCode === 92 ||
      evt.code === 'OSLeft' ||
      evt.code === 'OSLeft' ||
      evt.code === 'OSRight'
    ) {
      document.body.appendChild(styleElement);
    }
  };

  document.onkeyup = (evt: KeyboardEvent) => {
    // ⌘ command按键
    if (
      evt.keyCode === 91 ||
      evt.keyCode === 92 ||
      evt.code === 'OSLeft' ||
      evt.code === 'OSLeft' ||
      evt.code === 'OSRight'
    ) {
      document.body.removeChild(styleElement);
    }
  };
  // 📌 显示优化 非必要 end
}
