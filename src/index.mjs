import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Events, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';

dotenv.config();

let voteName = "";
let voteDescription = "";
let voteChannelID = "";

const up = new ButtonBuilder()
    .setCustomId("up")
    .setLabel('찬')
    .setStyle(ButtonStyle.Success);

const down = new ButtonBuilder()
    .setCustomId("down")
    .setLabel('반')
    .setStyle(ButtonStyle.Danger);
                    
const row = new ActionRowBuilder()
    .addComponents(up, down);


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

    if (commandName == "투표") {
        if (args.length < 2 || !['시작', '제목', '내용', '결산', '채널'].includes(args[1])) {
            msg.reply("!투표 (시작 / 제목 / 내용 / 채널 / 결산)");
            return;
        }

        switch (args[1]) {
            case "시작":
                const embed = new EmbedBuilder()
                    .setTitle(voteName)
                    .setTimestamp()
                    .setDescription(voteDescription)
                    .setFooter({ text: "익명 투표봇 by hooss" });

                client.channels.cache.get(voteChannelID).send({ embeds: [embed], components: [row] });
                break;
            
            case "제목":
                if (args.length < 3) {
                    msg.reply("!투표 (제목 / 내용) <TEXT>");
                    break;
                }
                voteName = args.slice(2).join(' ');
                break;

            case "내용":
                if (args.length < 3) {
                    msg.reply("!투표 (제목 / 내용) <TEXT>");
                    break;
                }
                voteDescription = args.slice(2).join(' ');
                break;
            
            case "채널":
                if (args.length < 3) {
                    msg.reply("!투표 채널 <ID>");
                    break;
                }
                voteChannelID = args[2];
                break;

            case "결산":
                break;
        }
    }
});

client.on("interactionCreate", (interaction) => {
    if (!interaction.isButton) return;
    
    console.log(interaction.customId);

    return;
});

client.login(process.env.TOKEN);