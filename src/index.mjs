import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Events, PermissionsBitField } from 'discord.js';

dotenv.config();

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildMessages 
]});

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith('!')) return;
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const args = msg.content.slice(1).split(' ');
    const commandName = args[0];
});

client.login(process.env.TOKEN);