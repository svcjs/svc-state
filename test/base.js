import test from 'ava'
import { State } from '../src/index'

test('simple', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    s.bind('aaa', (data) => {
      t.true(data.aaa === 111)
      resolve()
    })
    s.set('aaa', 111)
  })
})

test('return changes', t => {
  return new Promise((resolve, reject) => {
    let s = new State('changes')
    s.state.ccc = 3.1
    s.bind('aaa', (data) => {
      t.true(data.aaa === 111 && data.bbb === '222' && data.ccc === undefined)
      resolve()
    })
    s.set('aaa', 111)
    s.set('bbb', '222')
  })
})

test('return binds', t => {
  return new Promise((resolve, reject) => {
    let s = new State('binds')
    s.state.ccc = 3.1
    s.bind('aaa', (data) => {
      t.true(data.aaa === 111 && data.bbb === undefined && data.ccc === undefined)
      resolve()
    })
    s.set('aaa', 111)
    s.set('bbb', '222')
  })
})

test('return all', t => {
  return new Promise((resolve, reject) => {
    let s = new State('all')
    s.state.ccc = 3.1
    s.bind('aaa', (data) => {
      t.true(data.aaa === 111 && data.bbb === '222' && data.ccc === 3.1)
      resolve()
    })
    s.set('aaa', 111)
    s.set('bbb', '222')
  })
})

test('return all by binds', t => {
  return new Promise((resolve, reject) => {
    let s = new State('binds')
    s.state.ccc = 3.1
    s.bind('*', (data) => {
      t.true(data.aaa === 111 && data.bbb === '222' && data.ccc === 3.1)
      resolve()
    })
    s.set('aaa', 111)
    s.set('bbb', '222')
  })
})

test('return none', t => {
  return new Promise((resolve, reject) => {
    let s = new State('none')
    s.state.ccc = 3.1
    s.bind('aaa', (data) => {
      t.true(data.aaa === undefined && data.bbb === undefined && data.ccc === undefined)
      resolve()
    })
    s.set('aaa', 111)
    s.set('bbb', '222')
  })
})

test('in object', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    let o = {name: 'xxx'}
    s.bind(['aaa', 'bbb'], o)
    s.set('aaa', 111)
    s.set('bbb', '222')
    setTimeout(() => {
      t.true(o.name === 'xxx' && o.aaa === 111 && o.bbb === '222')
      resolve()
    }, 1)
  })
})

test('in loop', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    s.bind('aaa', (data) => {
      t.true(data['aaa'] === 9)
      resolve()
    })
    for (let i = 1; i < 10; i++) {
      s.set('aaa', i)
    }
  })
})

test('callback', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    let i = 1
    s.bind('aaa', (data) => {
      t.true(data.aaa === 111)
      i = 2
      resolve()
    })
    s.set('aaa', 111).then(() => {
      t.true(i === 2)
    })
    t.true(i === 1)
  })
})

test('special', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    s.bind('aaa.bb.123', (data) => {
      t.true(data['aaa.bb.123'] === 111)
      resolve()
    })
    s.set('aaa.bb.123', 111)
  })
})

test('in set', t => {
  return new Promise((resolve, reject) => {
    let times = 0
    let s = new State()
    let o = {
      setState: (data) => {
        t.true(data['aaa'] === 'hello')
        if (++times === 2) {
          resolve()
        }
      }
    }
    let o2 = {
      setState: (data) => {
        t.true(data['aaa'] === 'hello')
        if (++times === 2) {
          resolve()
        }
      }
    }
    s.bind('aaa', o)
    s.bind('aaa', o2)
    s.set({aaa: 'hello'})
  })
})

test('in setData', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    let o = {
      setData: () => {
        let data = s.get(['aaa', 'bbb', 'ccc'])
        t.true(data.aaa === 'hello' && data.bbb === 123 && data.ccc === false)
        resolve()
      }
    }
    s.bind('*', o)
    s.set('aaa', 'hello')
    s.set({bbb: 123, ccc: false})
  })
})

test('in special method', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    let o = {
      setXXX: () => {
        let data = s.get('aaa')
        t.true(data.aaa === 'hello')
        resolve()
      }
    }
    s.bind('aaa', o.setXXX.bind(o))
    s.set('aaa', 'hello')
  })
})

test('unbind', t => {
  return new Promise((resolve, reject) => {
    let s = new State()

    function bindFunction (data) {
      t.true(false)
      resolve()
    }

    s.bind('aaa', bindFunction)
    s.unbind('aaa', bindFunction)
    s.set('aaa', 111)
    setTimeout(() => {
      t.true(true)
      resolve()
    }, 1)
  })
})

test('unbind2', t => {
  return new Promise((resolve, reject) => {
    let s = new State()

    function bindFunction (data) {
      t.true(false)
      resolve()
    }

    s.bind('aaa', bindFunction)
    s.unbind(['aaa'], bindFunction)
    s.set('aaa', 111)
    setTimeout(() => {
      t.true(true)
      resolve()
    }, 1)
  })
})
