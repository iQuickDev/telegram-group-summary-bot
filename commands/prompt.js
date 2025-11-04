const { generateCustomPrompt } = require('../ai')

function parsePromptCommand(text) {
    const args = text.split(' ').slice(1) // Remove /prompt
    const params = {
        context: null, // 'all', 'self', or array of usernames
        limit: 500,
        message: ''
    }
    
    let i = 0
    while (i < args.length) {
        const arg = args[i]
        
        if (arg === '-c') {
            i++
            if (i < args.length && !args[i].startsWith('-')) {
                if (args[i] === 'all') {
                    params.context = 'all'
                } else if (args[i] === 'self') {
                    params.context = 'self'
                } else {
                    // Parse mentions like @user1 @user2
                    const mentions = []
                    while (i < args.length && args[i].startsWith('@')) {
                        mentions.push(args[i].substring(1))
                        i++
                    }
                    i-- // Back one step since we'll increment at end of loop
                    params.context = mentions
                }
            } else {
                i-- // Go back if no valid value after -c
            }
        } else if (arg === '-l') {
            i++
            if (i < args.length) {
                params.limit = Math.min(parseInt(args[i]) || 500, 1000)
            }
        } else if (arg === '-m') {
            i++
            // Rest of arguments are the message
            params.message = args.slice(i).join(' ')
            break
        }
        i++
    }
    
    return params
}

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
    
    const canUse = await db.canUsePrompt(userId)
    if (!canUse) {
        ctx.reply('Puoi usare il comando /prompt solo ogni 10 minuti')
        return
    }
    
    const text = ctx.update.message.text
    const params = parsePromptCommand(text)
    
    if (!params.message) {
        ctx.reply('Usage: /prompt -c [all|self|@user1 @user2] -l [limit] -m [your prompt message]')
        return
    }
    
    await db.recordPromptUsage(userId)
    
    let messages = ''
    
    if (params.context === 'all') {
        messages = await db.getLastNMessagesFormatted(params.limit)
    } else if (params.context === 'self') {
        const telegramId = ctx.update.message.from.id
        const userId = await db.getUserId(telegramId)
        const userMessages = await db.getUserMessages(userId)
        messages = userMessages
    } else if (Array.isArray(params.context)) {
        messages = await db.getMessagesFromUsers(params.context, params.limit)
    } else if (params.context === null) {
        messages = ''
    }
    
    const response = await generateCustomPrompt(messages, params.message)
    sendLongMessage(ctx, response)
}