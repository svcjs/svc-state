import test from 'ava'
import { State } from '../src/index'

let partConfigs = {left: '*cc', middle: 'aa*cc', right: 'aa*'}
for (let testName in partConfigs) {
  test(testName, t => {
    return new Promise((resolve, reject) => {
      let s = new State()
      s.bind(partConfigs[testName], (data) => {
        let gettedData = s.get(partConfigs[testName])
        t.true(data['aabbcc'] === 111)
        t.true(gettedData['aabbcc'] === 111)
        resolve()
      })
      s.set('aabbcc', 111)
    })
  })
}

test('multi', t => {
  return new Promise((resolve, reject) => {
    let s = new State()
    s.bind(['aa*', 'bb*', 'cc*3', 'dd.11-xx'], (data) => {
      t.true(
        data.aaa === '111' &&
        data.bb123 === true &&
        JSON.stringify(data.cc123) === '[1,2,"3"]' &&
        data['dd.11-xx']() === 1234567 &&
        data['xxx'] === undefined
      )
      resolve()
    })
    s.set('aaa', '111')
    s.set({
      bb123: true,
      cc123: [1, 2, '3'],
      'dd.11-xx': function () {
        return 1234567
      }
    })
  })
})
