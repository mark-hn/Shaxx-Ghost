const { Client, EmbedBuilder, GatewayIntentBits, Events } = require('discord.js');

const getItemInformation = require('./item-info.js')
const { getXurInventory, getBansheeInventory } = require('./vendor-inv.js')

const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
    console.log('The bot is online');
})


// Process interactions with the bot

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'info') {
        infoCommand(interaction);
    } else if (interaction.commandName === 'gunsmith') {
        await gunsmithCommand(interaction);
    }
})


// Functions which handle commands

function infoCommand(interaction) {
    const itemName = interaction.options.get('item-name').value;

    getItemInformation(process.env.BUNGIE_API_KEY, itemName).then(function (result) {
        if (typeof result === 'string' || result instanceof String) {
            interaction.reply(result)
        } else {
            let colour = undefined
            if (result.itemRarity === 'Exotic') {
                colour = 'Yellow';
            } else if (result.itemRarity === 'Legendary') {
                colour = 'Purple';
            } else if (result.itemRarity === 'Rare') {
                colour = 'Blue';
            } else if (result.itemRarity === 'Common') {
                colour = 'Green';
            } else {
                colour = 'Grey';
            }

            let embed = undefined
            if (result.itemCategory === 'Weapon') {
                embed = new EmbedBuilder()
                    .setTitle(result.itemName)
                    .setColor(colour)
                    .setURL('https://www.light.gg/db/items/' + result.hash)
                    .setThumbnail('https://www.bungie.net' + result.itemIcon)
                    .setFooter({ text: result.itemName + ' item information', iconURL: 'https://www.pngkey.com/png/full/440-4408148_destiny-clipart-destiny-game-destiny.png' })
                    .setTimestamp()
                    .addFields(
                        { name: 'Type:', value: result.itemType, inline: true },
                        { name: 'Slot:', value: result.itemSlot, inline: true },
                        { name: 'Damage:', value: result.itemDamage, inline: true },
                        { name: 'Flavor text:', value: result.itemDescription },
                    )
            } else if (result.itemCategory === 'Armour') {
                embed = new EmbedBuilder()
                    .setTitle(result.itemName)
                    .setColor(colour)
                    .setURL('https://www.light.gg/db/items/' + result.hash)
                    .setThumbnail('https://www.bungie.net' + result.itemIcon)
                    .setFooter({ text: result.itemName + ' item information', iconURL: 'https://www.pngkey.com/png/full/440-4408148_destiny-clipart-destiny-game-destiny.png' })
                    .setTimestamp()
                    .addFields(
                        { name: 'Type:', value: result.itemType, inline: true },
                        { name: 'Slot:', value: result.itemSlot, inline: true },
                        { name: 'Class:', value: result.itemClass, inline: true },
                        { name: 'Flavor text:', value: result.itemDescription },
                    )
            }
            // reply to message with embed
            interaction.reply({ embeds: [embed] })
        }
    })
}

async function gunsmithCommand(interaction) {
    await interaction.reply('Processing request...');

    inventory = await getBansheeInventory();
    console.log(inventory);

    let weekly_weapons = [];
    let featured_weapons = [];

    for (let item in inventory) {
        let date = new Date(inventory[item]);

        if (date.getDay() === 2) {
            weekly_weapons.push(item);
        } else {
            featured_weapons.push(item);
        }
    }

    console.log(weekly_weapons);
    console.log(featured_weapons);

    embed = new EmbedBuilder()
        .setTitle('Banshee-44: The Gunsmith')
        .setURL('https://www.light.gg/db/vendors/672118013/banshee-44/')
        .setThumbnail('https://www.bungie.net/common/destiny2_content/icons/d40e1942e625152534d12c23b6d1cdb3.png')
        .setDescription('Banshee-44 has lived many lives. As master weaponsmith for the Tower, he supplies Guardians with only the best.')
        .setFooter({ text: 'Banshee-44 inventory', iconURL: 'https://www.pngkey.com/png/full/440-4408148_destiny-clipart-destiny-game-destiny.png' })
        .setTimestamp()

    if (weekly_weapons.length > 0) {
        embed.addFields({ name: 'Weekly Weapons:', value: weekly_weapons.join(', ') });
    } if (featured_weapons.length > 0) {
        embed.addFields({ name: 'Featured Weapons:', value: featured_weapons.join(', ') });
    }

    await interaction.editReply({ embeds: [embed] });
}
