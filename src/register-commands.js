const dotenv = require('dotenv');
dotenv.config();

const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

// List of commands
const commands = [
    {
        name: 'info',
        description: 'Obtain the information of an item.',
        options: [
            {
                name: 'item-name',
                description: 'The name of the item.',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ]
    },
    {
        name: 'gunsmith',
        description: "Obtain the gunsmith's sales."
    },
    {
        name: 'xur',
        description: "Obtain Xûr's sales."
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Slash commands were registered');

    } catch (error) {
        console.log(`Error: ${error}`);
    };
})();