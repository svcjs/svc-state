class IState {
  // 获取数据，传入数组一次取多个，也可以直接访问State对象不通过 get
  getState (keyOrKeys) {
  }

  // 设置数据，传入对象一次存多个
  setState (keyOrValues, value) {
  }

  // 绑定数据变化通知
  bind (target, keyOrKeys) {
  }

  // 取消绑定
  unbind (target, keyOrKeys) {
  }
}

module.exports = IState