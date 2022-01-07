import { Bot, Middleware } from 'mirai-js'
import fs from 'fs'
import yaml from 'js-yaml'
import { qq } from './secret.js'
import { useBot, onMessage, onFriendRequest, onMemberJoin, onSelfJoin } from './libs/bot.js'

const setting = yaml.load(
  fs.readFileSync(
    './setting.yml',
    'utf8'
  )
)

const bot = new Bot()
useBot(bot)

const endpointOption = {
  baseUrl: 'http://localhost:8080',
  verifyKey: setting.verifyKey,
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
}

main().catch(console.error)