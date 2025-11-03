module.exports = async (ctx, db) => {
    const helpMessage = "Comandi disponibili:\n" +
        "/summary <n> - Genera un riassunto degli ultimi N messaggi (default 100, max 500)\n" +
        "/summaries - Mostra lista dei riassunti con ID e timestamp\n" +
        "/view <id> - Mostra un riassunto specifico per ID\n" +
        "/last - Mostra l'ultimo riassunto generato\n" +
        "/self - Genera una descrizione di te basata sui tuoi messaggi\n" +
        "/custom <messaggio> - Chiedi qualcosa di specifico sui tuoi messaggi\n" +
        "/prompt -c [all|self|@user1] -l [limit] -m [messaggio] - Prompt personalizzato con parametri\n" +
        "/help - Mostra questo messaggio di aiuto\n" +
        "Powered by iQuick"
    ctx.reply(helpMessage)
}