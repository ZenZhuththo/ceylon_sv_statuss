const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const Gamedig = require('gamedig');
const { token, clientId, guildId, serverIp, serverPort, allowedRoleId } = require('./config.json'); // Adicione o ID do cargo permitido no config.json

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const commands = [
    new SlashCommandBuilder().setName('status').setDescription('Server status command!'),
    new SlashCommandBuilder().setName('playerson').setDescription('Show members on server')
];

const rest = new REST({ version: '10' }).setToken(token);

let messageId; 

// Function to clear old commands registered on the server
const clearCommands = async () => {
    try {
        const commands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
        for (const command of commands) {
            await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id));
        }
        console.log('Old commands removed successfully.');
    } catch (error) {
        console.error('Error removing old commands:', error);
    }
};

// Register new commands on the server
const registerCommands = async () => {
    try {
        console.log('Starting the update of application commands (/)');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log('Application commands (/) registered successfully!');
    } catch (error) {
        console.error('Erro ao registrar os comandos:', error);
    }
};

client.once('ready', () => {
    console.log(`${client.user.username} Started and ready!`);

    clearCommands().then(registerCommands);

    setInterval(() => {
        Gamedig.query({
            type: 'mtasa',
            host: serverIp,
            port: serverPort
        }).then((state) => {
            client.user.setActivity({ name: `${state.raw.numplayers}/120 on Ceylon Roleplay` });
        }).catch(error => console.log(error));
    }, 5000);

    const updateMessage = async () => {
        if (!messageId) return; 

        try {
            const channel = await client.channels.fetch('1327133803558207548'); // Replace with channel ID
            const message = await channel.messages.fetch(messageId);
            
            const nextUpdateTimestamp = new Date(Date.now() + 60000); 
            const formattedNextUpdate = `<t:${Math.floor(nextUpdateTimestamp / 1000)}:R>`; 

            Gamedig.query({
                type: 'mtasa',
                host: serverIp,
                port: serverPort
            }).then(async (state) => {
                const embed = new EmbedBuilder()
                    .setTitle(state.name)
                    .setDescription('Connect to our server!')
                    .setFooter({ text: `${client.user.username} atualizado`, iconURL: client.user.avatarURL() })
                    .setImage('https://cdn.discordapp.com/attachments/1201432052814323713/1342745742003011666/download.png?ex=67d7c1eb&is=67d6706b&hm=8fe6db9e53b61aa0c3db0bbc2197d407c07779da2e0fdec47de7c85ff8038fef&')
                    .setColor('#fcc200')
                    .addFields(
                        {
                            name: '>>> __Players:__',
                            value: "```ansi\n[2;34m🎮 " + `${state.raw.numplayers}/${state.maxplayers}` + "[0m```",
                            inline: true
                        },
                        {
                            name: '>>> __Status:__',
                            value: "```ansi\n[2;32m🟢 Online[0m```",
                            inline: true
                        },
                        {
                            name: '>>> __Server Ip__',
                            value: "```ansi\n[2;32m" + `${state.connect}` + "[0m```"
                        },
                        {
                            name: '>>> __Next Update:__',
                            value: `The message will be updated ${formattedNextUpdate}.`
                        }
                    )
                    .setTimestamp();

                    const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('play')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://ceylonroleplaymta.com')
                            .setEmoji('🔗'),
                        new ButtonBuilder()
                            .setLabel('Discord')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/TquCQE93f4')
                            .setEmoji('📄')
                    );

                await message.edit({ embeds: [embed], components: [row] });
            }).catch(error => console.log(error));
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    setInterval(updateMessage, 60000); 
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'status') {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        Gamedig.query({
            type: 'mtasa',
            host: serverIp,
            port: serverPort
        }).then(async (state) => {
            const embed = new EmbedBuilder()
                .setTitle(state.name)
                .setDescription('Connect to our server!')
                .setFooter({ text: `${interaction.member.user.tag} Being updated every minute`, iconURL: interaction.member.avatarURL() })
                .setImage('https://cdn.discordapp.com/attachments/1201432052814323713/1342745742003011666/download.png?ex=67d7c1eb&is=67d6706b&hm=8fe6db9e53b61aa0c3db0bbc2197d407c07779da2e0fdec47de7c85ff8038fef&')
                .setThumbnail('https://example.com/thumb.png')
                .setColor('#fcc200')
                .addFields(
                    {
                        name: '>>> __Players:__',
                        value: "```ansi\n[2;34m🎮 " + `${state.raw.numplayers}/${state.maxplayers}` + "[0m```",
                        inline: true
                    },
                    {
                        name: '>>> __Status:__',
                        value: "```ansi\n[2;32m🟢 Online[0m```",
                        inline: true
                    },
                    {
                        name: '>>> __Server Ip__',
                        value: "```ansi\n[2;32m" + `${state.connect}` + "[0m```"
                    }
                )
                .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Play')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://ceylonroleplaymta.com')
                            .setEmoji('🔗'),
                        new ButtonBuilder()
                            .setLabel('Rules')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/TquCQE93f4')
                            .setEmoji('📄')
                    );

            const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
            messageId = reply.id; 
        }).catch(error => console.log(error));
    }

    if (commandName === 'playercount') {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        Gamedig.query({
            type: 'mtasa',
            host: serverIp,
            port: serverPort
        }).then((state) => {
            interaction.reply(`There are ${state.raw.numplayers}/${state.maxplayers} players currently on the server.`);
        }).catch(error => console.log(error));
    }
});

// 
client.login(token);
