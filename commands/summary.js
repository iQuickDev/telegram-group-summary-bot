const { generateSummary } = require('../ai')

module.exports = async (ctx, db) => {
    const text = ctx.update.message.text
    const telegramId = ctx.update.message.from.id
    
    const fetchCount = parseInt(text.split(' ')[1] || 100)

    if (fetchCount > 500) {
        ctx.reply('Puoi richiedere al massimo 500 messaggi per il riassunto')
        return
    }

    const userId = await db.getUserId(telegramId)
    const messageId = await db.saveMessage(userId, text)
    
    const formattedMessages = await db.getLastNMessagesFormatted(fetchCount)
    const lastSummaryMessageId = await db.getLastSummaryMessageId()
    const messagesSinceLastSummary = await db.getMessageCountSince(lastSummaryMessageId)

    if (messagesSinceLastSummary < 100) {
        ctx.reply(`Non sono stati inviati abbastanza messaggi dall'ultimo riassunto (almeno 100)`)
        return
    }

    const summary = await generateSummary(formattedMessages)
    await db.saveSummary(userId, summary, messageId)
    ctx.reply(summary)
}