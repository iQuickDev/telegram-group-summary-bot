const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const dotenv = require('dotenv')
const Database = require('./database')
const commands = require('./commands')
const { generateResponse, generateSpontaneousResponse } = require('./ai')

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const db = new Database()

bot.on(message('text'), async (ctx) => {
    const author = ctx.update.message.from.username
    const telegramId = ctx.update.message.from.id
    const text = ctx.update.message.text
    const botUsername = ctx.botInfo.username

    try {
        await db.saveUser(author, telegramId)
        
        if (!text.startsWith('/')) {
            const userId = await db.getUserId(telegramId)
            await db.saveMessage(userId, text)
            
            if (text.includes(`@${botUsername}`)) {
                const messages = await db.getRecentMessages(100)
                const response = await generateResponse(messages, text)
                if (response) {
                    await ctx.reply(response)
                }
            }
            return
        }

        const command = text.split(' ')[0].substring(1)
        
        if (commands[command]) {
            await commands[command](ctx, db)
        }
    } catch (error) {
        ctx.reply(JSON.stringify(error, null, 2))
        console.error(error)
    }
})

bot.launch()

process.once('SIGINT', () =>
{
    db.close()
    bot.stop('SIGINT')
})
process.once('SIGTERM', () =>
{
    db.close()
    bot.stop('SIGTERM')
})