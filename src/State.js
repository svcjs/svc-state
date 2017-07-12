export default class State {
  constructor (whichDataResolved) {
    this.state = {}
    this._whichDataResolved = whichDataResolved || 'changes' // changes binds all none
    this._changedStates = {}
    this._setResolves = []
    this._binds = {}
    this._partBindsCache = {}
    this._tid = 0
  }

  _testIfMatch (partKey, realKey) {
    let pos = partKey.indexOf('*')
    if (pos !== -1) {
      let k1 = partKey.substr(0, pos)
      let k2 = partKey.substr(pos + 1)
      return (k1 && !k2 && realKey.startsWith(k1)) ||
        (k2 && !k1 && realKey.endsWith(k2)) ||
        (k1 && k2 && realKey.startsWith(k1) && realKey.endsWith(k2))
    }
  }

  _notice () {
    let pendingTargets = []
    for (let bindKey in this._binds) {
      if (bindKey === '*') {
        // all match
        pendingTargets.push(this._binds[bindKey])
      } else {
        let pos = bindKey.indexOf('*')
        if (pos === -1) {
          if (this._changedStates[bindKey] !== undefined && pendingTargets.indexOf(this._binds[bindKey]) === -1) {
            // exact match
            pendingTargets.push(this._binds[bindKey])
          }
        } else {
          let k1 = bindKey.substr(0, pos)
          let k2 = bindKey.substr(pos + 1)
          let partBinds = this._partBindsCache[bindKey]
          if (!partBinds) {
            partBinds = []
            // make part binds cache
            for (let stateKey in this.state) {
              if ((k1 && !k2 && stateKey.startsWith(k1)) ||
                (k2 && !k1 && stateKey.endsWith(k2)) ||
                (k1 && k2 && stateKey.startsWith(k1) && stateKey.endsWith(k2))) {
                partBinds.push(stateKey)
              }
            }
            this._partBindsCache[bindKey] = partBinds
          }

          for (let stateKey of partBinds) {
            if (this._changedStates[stateKey] !== undefined && pendingTargets.indexOf(this._binds[bindKey]) === -1) {
              // part match
              pendingTargets.push(this._binds[bindKey])
            }
          }
        }
      }
    }

    for (let targets of pendingTargets) {
      for (let target of targets) {
        let data = {}
        switch (this._whichDataResolved) {
          case 'changes':
            data = this._changedStates
            break
          case 'binds':
            data = this.get(target.keys)
            break
          case 'all':
            data = this.state
            break
        }

        if (target.func === null && typeof target.object === 'object') {
          for (let key in data) {
            target.object[key] = data[key]
          }
        } else if (typeof target.func === 'function') {
          target.func.call(target.object, data)
        }
      }
    }

    for (let resolve of this._setResolves) {
      resolve()
    }

    this._changedStates = {}
    this._setResolves = []
    this._tid = 0
  }

  // 获取数据，传入数组一次取多个，也可以直接访问State对象不通过 get
  get (keyOrKeys) {
    if (!(keyOrKeys instanceof Array)) {
      keyOrKeys = [keyOrKeys]
    }
    let result = {}
    for (let key of keyOrKeys) {
      if (key === '*') {
        return this.state
      }
      if (key.indexOf('*') !== -1) {
        for (let stateKey in this.state) {
          if (this._testIfMatch(key, stateKey)) {
            result[stateKey] = this.state[stateKey]
          }
        }
      } else {
        result[key] = this.state[key]
      }
    }
    return result
  }

  // 设置数据，传入对象一次存多个
  set (keyOrValues, value) {
    let values = typeof keyOrValues === 'string' ? {[keyOrValues]: value} : keyOrValues
    let hasNew = false
    for (let key in values) {
      if (this.state[key] === undefined) hasNew = true
      this.state[key] = values[key]
      this._changedStates[key] = values[key]
    }

    if (hasNew) {
      // clear part binds when add new state
      this._partBindsCache = {}
    }

    if (!this._tid) {
      this._tid = setTimeout(this._notice.bind(this), 0)
    }

    let that = this
    return new Promise(function (resolve, reject) {
      that._setResolves.push(resolve)
    })
  }

  // 绑定数据变化通知
  bind (keyOrKeys, target) {
    if (!(keyOrKeys instanceof Array)) keyOrKeys = [keyOrKeys]
    let bindTarget = {
      object: null,
      func: null,
      keys: keyOrKeys
    }

    // 构建回调对象
    if (typeof target === 'function') {
      // direct call function
      bindTarget.func = target
    } else if (typeof target === 'object') {
      // call object's [set or setData]
      let settingFunction = target['setState'] ? target['setState'] : (target['setData'] ? target['setData'] : null)
      if (settingFunction && typeof settingFunction === 'function') {
        bindTarget.object = target
        bindTarget.func = settingFunction
      } else {
        bindTarget.object = target
      }
    }

    for (let key of keyOrKeys) {
      if (!this._binds[key]) this._binds[key] = []
      this._binds[key].push(bindTarget)
      this._partBindsCache[key] = null
    }
  }

  // 取消绑定
  unbind (keyOrKeys, target) {
    if (!(keyOrKeys instanceof Array)) {
      keyOrKeys = [keyOrKeys]
    }
    let jsonKeys = JSON.stringify(keyOrKeys)
    for (let key of keyOrKeys) {
      let bindTargets = this._binds[key]
      if (bindTargets) {
        for (let i = bindTargets.length - 1; i >= 0; i--) {
          let bindTarget = bindTargets[i]
          if ((bindTarget.object === target || bindTarget.func === target) && JSON.stringify(bindTarget.keys) === jsonKeys) {
            this._binds[key].splice(i, 1)
          }
        }
      }
      this._partBindsCache[key] = null
    }
    this._partBindsCache = {}
  }
}
