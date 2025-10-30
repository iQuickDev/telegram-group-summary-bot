module.exports = async (ctx, db) => {
    const summary = await db.getLastSummary()
    if (!summary) {
        ctx.reply('Nessun riassunto disponibile')
        return
    }
    ctx.reply(summary)
}