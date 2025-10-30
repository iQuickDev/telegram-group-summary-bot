const { generateCustomResponse } = require('../ai')

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
    const text = ctx.update.message.text
    const telegramId = ctx.update.message.from.id
    const userId = await db.getUserId(telegramId)
    
    const customMessage = text.substring(8).trim()
    if (!customMessage) {
        ctx.reply('Specifica un messaggio: /custom <il tuo messaggio>')
        return
    }
    
    const canGenerate = await db.canGenerateUserDescription(userId)
    if (!canGenerate) {
        ctx.reply('Puoi generare una nuova descrizione solo ogni 24 ore')
        return
    }
    
    const userMessages = await db.getUserMessages(userId)
    if (!userMessages) {
        ctx.reply('Non hai ancora inviato messaggi')
        return
    }
    
    const response = await generateCustomResponse(userMessages, customMessage)
    await db.saveUserDescription(userId, response)
    sendLongMessage(ctx, response)
}