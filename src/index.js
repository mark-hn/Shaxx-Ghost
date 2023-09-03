const { Client, EmbedBuilder, GatewayIntentBits, Events, hyperlink } = require('discord.js');

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
    } else if (interaction.commandName === 'xur') {
        await xurCommand(interaction);
    }
})


// Functions which handle commands

function infoCommand(interaction) {
    const itemName = interaction.options.get('item-name').value;

    getItemInformation(process.env.BUNGIE_API_KEY, itemName).then(function (result) {
        if (typeof result === 'string' || result instanceof String) {
            interaction.reply(result)
        } else {
            // Set the colour of the embed border
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

            // Building embed object
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
            // Reply to message with embed
            interaction.reply({ embeds: [embed] })
        }
    })
}

async function gunsmithCommand(interaction) {
    await interaction.reply('Processing request...');

    const inventory = await getBansheeInventory()

    let weekly_weapons = [];
    let featured_weapons = [];

    // Convert refresh date to Date object and classify items as weekly or featured weapons
    for (let item of inventory) {
        let date = new Date(item.refreshDate);

        if (date.getDay() === 2 && weekly_weapons.length < 6) {
            weekly_weapons.push(`[${item.name}](https://www.light.gg/db/items/${item.hash})`);
        } else {
            featured_weapons.push(`[${item.name}](https://www.light.gg/db/items/${item.hash})`);
        }
    }

    // Build embed object
    embed = new EmbedBuilder()
        .setTitle('Banshee-44: The Gunsmith')
        .setURL('https://www.light.gg/db/vendors/672118013/banshee-44/')
        .setThumbnail('https://www.bungie.net/common/destiny2_content/icons/d40e1942e625152534d12c23b6d1cdb3.png')
        .setDescription('Banshee-44 has lived many lives. As master weaponsmith for the Tower, he supplies Guardians with only the best.')
        .setFooter({ text: "Banshee-44's inventory", iconURL: 'https://www.pngkey.com/png/full/440-4408148_destiny-clipart-destiny-game-destiny.png' })
        .setTimestamp()

    // Add separate fields for weekly/featured weapons
    if (weekly_weapons.length > 0) {
        embed.addFields({ name: 'Weekly Weapons:', value: weekly_weapons.join(', ') });
    } if (featured_weapons.length > 0) {
        embed.addFields({ name: 'Daily Weapons:', value: featured_weapons.join(', ') });
    }

    // Edit message by adding embed
    await interaction.editReply({ embeds: [embed] });
}

async function xurCommand(interaction) {
    await interaction.reply('Processing request...');

    const inventory = await getXurInventory();

    if (typeof inventory === 'string') {
        // Obtain timestamp for Xur's return
        const currentDate = new Date();
        const daysUntilNextFriday = (12 - currentDate.getDay()) % 7;
        const nextFriday = new Date(currentDate);
        nextFriday.setDate(currentDate.getDate() + daysUntilNextFriday);
        nextFriday.setHours(13, 0, 0, 0);
        const unixTime = Math.floor(nextFriday.getTime() / 1000);

        // Build embed object
        embed = new EmbedBuilder()
            .setTitle('Xûr: Agent of the Nine')
            .setURL('https://www.light.gg/db/vendors/2190858386/x%C3%BBr/')
            .setThumbnail('https://www.bungie.net/img/destiny_content/vendor/icons/xur_large_icon.png')
            .setDescription(`A peddler of strange curios, Xûr's motives are not his own. He bows to his distant masters, the Nine.`)
            .setFooter({ text: "Xûr's inventory", iconURL: 'https://www.pngkey.com/png/full/440-4408148_destiny-clipart-destiny-game-destiny.png' })
            .setTimestamp()
            .addFields({ name: 'Xûr is currently on hiatus', value: `He will return <t:${unixTime}:R>.` })

        // Edit message by adding embed
        await interaction.editReply({ embeds: [embed] });
    } else {
        // Obtain timestamp for Xur's departure
        const currentDate = new Date();
        const daysUntilNextTuesday = (9 - currentDate.getDay()) % 7;
        const nextTuesday = new Date(currentDate);
        nextTuesday.setDate(currentDate.getDate() + daysUntilNextTuesday);
        nextTuesday.setHours(13, 0, 0, 0);
        const unixTime = Math.floor(nextTuesday.getTime() / 1000);

        // Build embed object
        embed = new EmbedBuilder()
            .setTitle('Xûr: Agent of the Nine')
            .setURL('https://www.light.gg/db/vendors/2190858386/x%C3%BBr/')
            .setThumbnail('https://www.bungie.net/img/destiny_content/vendor/icons/xur_large_icon.png')
            .setDescription(`A peddler of strange curios, Xûr's motives are not his own. He bows to his distant masters, the Nine. Xûr will depart <t:${unixTime}:R>.`)
            .setFooter({ text: "Xûr's inventory", iconURL: 'https://www.pngkey.com/png/full/440-4408148_destiny-clipart-destiny-game-destiny.png' })
            .setTimestamp()

        // Add fields for Xur's sales
        for (let item of inventory.armour) {
            embed.addFields({ name: `${item.class} Armor`, value: `[${item.name}](https://www.light.gg/db/items/${item.hash})`, inline: true });
        }
        for (let item of inventory.weapons) {
            embed.addFields({ name: 'Weapon', value: `[${item.name}](https://www.light.gg/db/items/${item.hash})`, inline: true });
        }

        // Edit message by adding embed
        await interaction.editReply({ embeds: [embed] });
    }
}