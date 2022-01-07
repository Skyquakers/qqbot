import Nightmare from 'nightmare'

const nightmare = Nightmare({
  show: process.NODE_ENV === 'production' ? false : true
})

nightmare
  .goto('https://www.yuque.com/search?q=%E8%BF%9E%E4%B8%8D%E4%B8%8A&scope=pixelcloud')
  .evaluate(function () {
    return document.querySelector('ul.ant-list-items [data-testid="search-result-content"]').getAttribute('redirect-in-webview-href')
  })
  .end()
  .then(res => {
    console.log(res)
  })