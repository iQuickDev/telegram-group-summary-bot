const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const dotenv = require('dotenv')
const Database = require('./database')
const { generateSummary } = require('./ai')

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const db = new Database()

bot.on(message('text'), async (ctx) =>
{
    const author = ctx.update.message.from.username
    const telegramId = ctx.update.message.from.id
    const text = ctx.update.message.text

    try
    {
        await db.saveUser(author, telegramId)
        const userId = await db.getUserId(telegramId)

        const messageId = await db.saveMessage(userId, text)

        if (text.includes('/summary'))
        {
            const fetchCount = parseInt(text.split(' ')[1] || 100)

            if (fetchCount > 500)
            {
                ctx.reply('Puoi richiedere al massimo 500 messaggi per il riassunto')
            }

            const formattedMessages = await db.getLastNMessagesFormatted(fetchCount)
            const lastSummaryMessageId = await db.getLastSummaryMessageId()
            const messagesSinceLastSummary = await db.getMessageCountSince(lastSummaryMessageId)

            if (messagesSinceLastSummary < 100)
            {
                ctx.reply(`Non sono stati inviati abbastanza messaggi dall'ultimo riassunto (almeno 100)`)
                return
            }

            let summary = await generateSummary(formattedMessages)
            await db.saveSummary(userId, summary, messageId)
            ctx.reply(summary)

            return
        }

        if (text.includes('/summaries'))
        {
            const summaries = await db.getAllSummaries()
            if (summaries.length === 0) {
                ctx.reply('Nessun riassunto disponibile')
                return
            }
            const list = summaries.map(s => `ID: ${s.id} - ${s.timestamp}`).join('\n')
            ctx.reply(`Riassunti disponibili:\n${list}`)
            return
        }

        if (text.startsWith('/view '))
        {
            const id = parseInt(text.split(' ')[1])
            if (!id) {
                ctx.reply('Specifica un ID valido: /view <id>')
                return
            }
            const summary = await db.getSummaryById(id)
            if (!summary) {
                ctx.reply('Riassunto non trovato')
                return
            }
            ctx.reply(summary)
            return
        }

        if (text.includes('/help'))
        {
            let helpMessage = "Comandi disponibili:\n" +
            "/summary <n> - Genera un riassunto degli ultimi N messaggi (default 100, max 500)\n" +
            "/summaries - Mostra lista dei riassunti con ID e timestamp\n" +
            "/view <id> - Mostra un riassunto specifico per ID\n" +
            "/help - Mostra questo messaggio di aiuto\n" +
            "Powered by iQuick"
            ctx.reply(helpMessage)
        }


    } catch (error)
    {
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