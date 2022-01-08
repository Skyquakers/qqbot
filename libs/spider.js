import Nightmare from 'nightmare'
import Xvfb from 'xvfb'

const xvfb = new Xvfb()

export const search = function (query) {
  const nightmare = Nightmare({
    show: false
  })

  return new Promise((resolve, reject) => {
    xvfb.startSync()

    nightmare
      .goto(`https://www.yuque.com/search?q=${query}&scope=pixelcloud`)
      .wait(function () {
        return document.querySelector('ul.ant-list-items') !== null ||
               document.querySelector('[data-testid="empty-message"]') !== null
      })
      .evaluate(function () {
        
        const containers = [...document.querySelectorAll('ul.ant-list-items [data-testid="search-result-content"]')]
        docids = containers.map(dom => dom.getAttribute('redirect-in-webview-href'))
        titles = containers.map(dom => dom.querySelector('a').textContent)

        const results = []

        for (const [index, docid] of docids.entries()) {
          if (docid && titles[index]) {
            results.push({
              title: titles[index],
              docid,
            })
          }
        }

        return results
      })
      .end()
      .then(res => {
        resolve(res)
      })
      .then(() => {
        xvfb.stopSync()
      })
      .catch(err => {
        reject(err)
      })
  })
}