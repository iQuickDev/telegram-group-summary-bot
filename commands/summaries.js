module.exports = async (ctx, db) => {
    const summaries = await db.getAllSummaries()
    if (summaries.length === 0) {
        ctx.reply('Nessun riassunto disponibile')
        return
    }
    const list = summaries.map(s => `ID: ${s.id} - ${s.timestamp}`).join('\n')
    ctx.reply(`Riassunti disponibili:\n${list}`)
}