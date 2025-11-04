const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const dotenv = require('dotenv')
const Database = require('./database')
const commands = require('./commands')
const { generateCustomPrompt } = require('./ai')

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const db = new Database()

bot.on(message('text'), async (ctx) => {
    const author = ctx.update.message.from.username
    const telegramId = ctx.update.message.from.id
    const text = ctx.update.message.text

    try {
        await db.saveUser(author, telegramId)
        
        if (!text.startsWith('/')) {
            const userId = await db.getUserId(telegramId)
            await db.saveMessage(userId, text)
            return
        }

        const command = text.split(' ')[0].substring(1)
        
        if (commands[command]) {
            await commands[command](ctx, db)
        }
    } catch (error) {
        console.error(error)
    }
})

function scheduleAutoMessage() {
    const minHours = 1
    const maxHours = 2
    const randomHours = minHours + Math.random() * (maxHours - minHours)
    const delay = randomHours * 60 * 60 * 1000
    
    setTimeout(async () => {
        try {
            const messages = await db.getLastNMessagesFormatted(100)
            if (messages) {
                const response = await generateCustomPrompt(messages, "Commenta la conversazione recente del gruppo in modo naturale e spontaneo")
                bot.telegram.sendMessage(process.env.CHAT_ID, response)
            }
        } catch (error) {
            console.error('Auto message error:', error)
        }
        scheduleAutoMessage()
    }, delay)
}

bot.launch()
scheduleAutoMessage()

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