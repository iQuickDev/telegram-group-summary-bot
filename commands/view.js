module.exports = async (ctx, db) => {
    const text = ctx.update.message.text
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
}