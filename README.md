# Bot_DS
Bot for play music on discord and manage server

How to add a provider :

in add.js you'll find a condition in async execute(interaction); that's checking if the url includes youtube. you should modify that condition and add the code to handle that new provider

if (interaction.options.getString('url').includes('youtube')) {
    res = await yt.convertAudio({
        url: interaction.options.getString('url'),
        itag: 140,
        directoryDownload: Path,
    })
} if (YOUR CONDITION) {
    Provider handler
}

List Command:
    Command to play music in the channel
    /play song random

