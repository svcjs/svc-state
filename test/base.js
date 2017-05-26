import test from 'ava'
import State from '../'

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
    let o = {setState: (data) => {
      t.true(data['aaa'] === 'hello')
      if (++times === 2) {
        resolve()
      }
    }}
    let o2 = {setState: (data) => {
      t.true(data['aaa'] === 'hello')
      if (++times === 2) {
        resolve()
      }
    }}
    s.bind('aaa', o)
    s.bind('aaa', o2)
    s.set({aaa: 'hello'})
  })
})

test('in setData', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    let o = {setData: () => {
      let data = s.get(['aaa', 'bbb', 'ccc'])
      t.true(data.aaa === 'hello' && data.bbb === 123 && data.ccc === false)
      resolve()
    }}
    s.bind('*', o)
    s.set('aaa', 'hello')
    s.set({bbb: 123, ccc: false})
  })
})

test('in special method', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    let o = {setXXX: () => {
      let aaa = s.get('aaa')
      t.true(aaa === 'hello')
      resolve()
    }}
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
