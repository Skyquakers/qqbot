import { Message } from 'mirai-js'
import { search } from './spider.js'

const pendingQueries = new Set()
const pendingSize = 1
let bot = null

export const useBot = function (_bot) {
  bot = _bot
}

export const onMessage = async function (data, temp = false) {
  if (!bot) {
    throw new Error('bot not set')
  }

  const query = data.messageChain.filter(message => message.type === 'Plain').map(message => message.text)[0]

  const composeResult = async function () {
    if (!query) {
      return '请带上你的问题再发一遍'
    }

    if (pendingQueries.size >= pendingSize) {
      return '正在帮别人查，稍等一下喔'
    }

    pendingQueries.add(data.sender.id)
    console.log(`${new Date().toLocaleString()} ${data.sender.id}: search ${query}`)
    const start = Date.now()
    const docs = await search(query)
    console.log(`${new Date().toLocaleString()} ${data.sender.id}: got ${docs.length} results, took ${Date.now() - start} ms`)

    if (docs.length === 0) {
      return '我不知道，请在 https://yuque.com/pixelcloud 提交工单'
    }

    docs.forEach(doc => {
      doc.message = `${doc.title} - https://yuque.com${doc.docid}`
    })

    return docs.map(doc => doc.message).slice(0, 3).join('\n\n')
  }

  const result = await composeResult()

  if (temp) {
    await bot.sendMessage({
      temp: true,
      friend: data.sender.id,
      group: data.sender.group.id,
      message: new Message().addAt(data.sender.id).addText(` ${result}`),
    })
    console.log(`${new Date().toLocaleString()} ${data.sender.id}: reply to ${data.sender.id} from ${data.sender.group.id} temp message`)
  } else if (data.sender.group) {
    await bot.sendMessage({
      group: data.sender.group.id,
      message: new Message().addAt(data.sender.id).addText(` ${result}`),
    })
    console.log(`${new Date().toLocaleString()} ${data.sender.id}: reply to ${data.sender.id} in ${data.sender.group.id}`)
  } else {
    await bot.sendMessage({
      friend: data.sender.id,
      message: new Message().addText(result),
    })
    console.log(`${new Date().toLocaleString()} ${data.sender.id}: reply to ${data.sender.id}`)
  }

  pendingQueries.delete(data.sender.id)
}

export const onFriendRequest = async function (data) {
  if (!bot) {
    throw new Error('bot not set')
  }

  data.agree()
}

export const onMemberJoin = async function (data) {
  if (!bot) {
    throw new Error('bot not set')
  }

  await bot.sendMessage({
    group: data.member.group.id,
    message: new Message().addAt(data.member.id).addText(` 有问题请 at 我，私聊我。我不知道的话就在 https://yuque.com/pixelcloud 提交工单`)
  })
}

export const onSelfJoin = async function (data) {
  if (!bot) {
    throw new Error('bot not set')
  }

  await bot.sendMessage({
    group: data.group.id,
    message: new Message().addText('向我提问，解答 PixelCloud 问题'),
  })
}