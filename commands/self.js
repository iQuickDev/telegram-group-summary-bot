const { generateUserSummary } = require('../ai')

function sendLongMessage(ctx, text) {
    const parts = text.split('\n')
    let currentMessage = ''
    
    for (const part of parts) {
        if ((currentMessage + part + '\n').length > 4000) {
            if (currentMessage) ctx.reply(currentMessage.trim())
            currentMessage = part + '\n'
        } else {
            currentMessage += part + '\n'
        }
    }
    
    if (currentMessage) ctx.reply(currentMessage.trim())
}

module.exports = async (ctx, db) => {
    const telegramId = ctx.update.message.from.id
    const userId = await db.getUserId(telegramId)
    
    const canGenerate = await db.canGenerateUserDescription(userId)
    if (!canGenerate) {
        ctx.reply('Puoi generare una nuova descrizione solo ogni 10 minuti')
        return
    }
    
    const userMessages = await db.getUserMessages(userId)
    if (!userMessages) {
        ctx.reply('Non hai ancora inviato messaggi')
        return
    }
    
    const userDescription = await generateUserSummary(userMessages)
    await db.saveUserDescription(userId, userDescription)
    sendLongMessage(ctx, userDescription)
}