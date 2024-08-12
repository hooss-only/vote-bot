import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Events, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

dotenv.config();

let voteName = "";
let voteDescription = "";
let voteChannelID = ""; let logChannelID = "";
let up_voters = [];
let down_voters = [];
let vote_box = null;

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

    if (commandName === "투표") {
        if (args.length < 2 || !['시작', '제목', '내용', '결산', '채널', '미리보기', '로그'].includes(args[1])) {
            msg.reply("!투표 (시작 / 제목 / 내용 / 채널 / 결산 / 미리보기 / 로그)");
            return;
        }

        let embed;
        switch (args[1]) {
            case "시작":
                if (voteName === "" || voteDescription === "" || logChannelID === "" || voteChannelID === "") {
                    msg.reply("설정이 모두 되지 않았습니다.");
                    return;
                }
                if (vote_box != null) {
                    vote_box.then(msg => msg.delete());
                }
                embed = new EmbedBuilder()
                    .setTitle(voteName)
                    .setTimestamp()
                    .setDescription(voteDescription)
                    .setFooter({ text: "익명 투표봇 by hooss" });

                vote_box = client.channels.cache.get(voteChannelID).send({ embeds: [embed], components: [row] });
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

            case "로그":
                if (args.length < 3) {
                    msg.reply("!투표 로그 <ID>");
                    break;
                }
                logChannelID = args[2];
                msg.reply(`투표 로그 채널이 '${client.channels.cache.get(logChannelID).name}'으로 설정 되었습니다.`);
                break;
            
            case "채널":
                if (args.length < 3) {
                    msg.reply("!투표 채널 <ID>");
                    break;
                }
                voteChannelID = args[2];
                msg.reply(`투표 채널이 '${client.channels.cache.get(voteChannelID).name}'으로 설정 되었습니다.`);
                break;
			
            case "미리보기":
				embed = new EmbedBuilder()
                    .setTitle(voteName)
                    .setTimestamp()
                    .setDescription(voteDescription)
                    .setFooter({ text: "익명 투표봇 by hooss" });

                msg.channel.send({ content: `투표 채널은 '${client.channels.cache.get(voteChannelID).name}'입니다.`, embeds: [embed] });
				break;

            case "결산":
                let r_text = "";
                if (up_voters.length > down_voters.length) {
                    r_text = "찬성 승";
                } else if (up_voters.length < down_voters.length) {
                    r_text = "반대 승";
                } else {
                    r_text = "무승부";
                }

                let result = new EmbedBuilder()
                    .setTitle(`${voteName}, ${r_text} `)
                    .setDescription(`${up_voters.length} : ${down_voters.length}`)
                    .setTimestamp()
                    .setFooter({ text: "익명 투표봇 by hooss" });
                vote_box.then(msg => msg.delete());
                client.channels.cache.get(voteChannelID).send({ embeds: [result]});
                break;
        }
    }
});

client.on("interactionCreate", (interaction) => {
    if (!interaction.isButton) return;
    
    // vote
    // if he voted to the same side before, ignores.
    // and if he voted to the other side before, change it.
    if (interaction.customId === "up") {
  	    interaction.reply({ content: "찬성에 투표하셨습니다.", ephemeral: true });
        if (up_voters.includes(interaction.user.id)) return;
        if (down_voters.includes(interaction.user.id)) {
            down_voters.pop(down_voters.indexOf(interaction.user.id));
        }
        up_voters.push(interaction.user.id);
        client.channels.cache.get(logChannelID).send(`<@${interaction.user.id}>, **찬성** 진영에 투표하였습니다. ${up_voters.length} : ${down_voters.length}`);
	} else if (interaction.customId === "down") {
		interaction.reply({ content: "반대에 투표하셨습니다.", ephemeral: true });
        if (down_voters.includes(interaction.user.id)) return;
        if (up_voters.includes(interaction.user.id)) {
            up_voters.pop(up_voters.indexOf(interaction.user.id));
        }
        down_voters.push(interaction.user.id);
        client.channels.cache.get(logChannelID).send(`<@${interaction.user.id}>, **반대** 진영에 투표하였습니다. ${up_voters.length} : ${down_voters.length}`);
	}

    return;
});

client.login(process.env.TOKEN);
