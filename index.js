import { Bot, Middleware } from 'mirai-js'
import { qq, port, verifyKey } from './secret.js'
import { useBot, onMessage, onFriendRequest, onMemberJoin, onSelfJoin } from './libs/bot.js'

const bot = new Bot()
useBot(bot)

const endpointOption = {
  baseUrl: `http://localhost:${port}`,
  verifyKey,
}

const main = async function () {
  await bot.open({
    ...endpointOption,
    qq,
  })

  bot.on('FriendMessage', onMessage)
  bot.on('TempMessage', onMessage)
  bot.on('GroupMessage', new Middleware().atFilter([qq]).done(onMessage))
  bot.on('MemberJoinEvent', onMemberJoin)
  bot.on('NewFriendRequestEvent', new Middleware().friendRequestProcessor().done(onFriendRequest))
  bot.on('BotJoinGroupEvent', onSelfJoin)

  bot.on('error', (_, message) => {
    console.error(message)
  })
  bot.on('close', () => {
    console.log('bot', qq, 'closed')
  })
}

main().catch(console.error)