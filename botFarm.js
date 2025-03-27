const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, PermissionsBitField, Events, EmbedBuilder 
} = require('discord.js');

require('dotenv').config(); // Carregar variáveis de ambiente

const TOKEN = process.env.BOT_TOKEN; // Token do bot via variável de ambiente

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.GuildMember]
});

// ID do cargo que pode ver o canal de farm
const ALLOWED_ROLE_ID = '1208223183803777094'; // Substitua pelo ID do cargo que pode ver o canal de farm

client.once('ready', async () => {
    console.log(`Bot está online como ${client.user.tag}`);

    // Registrar o comando 'createfarm' no servidor
    const guild = client.guilds.cache.get('1208201761148379237'); // Substitua pelo ID do seu servidor
    if (guild) {
        await guild.commands.create({
            name: 'createfarm',
            description: 'Cria uma aba de farm exclusiva para o usuário',
        });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'create_farm') {
            // Nome do canal de farm (único para o usuário)
            const member = interaction.guild.members.cache.get(interaction.user.id);
            let channelName = member.nickname ? member.nickname.toLowerCase() : interaction.user.username.toLowerCase();

            // Garantir que o nome do canal seja válido
            channelName = channelName.replace(/[^a-z0-9-]/g, '-'); // Substitui caracteres inválidos por hífens
            if (channelName.length > 100) {
                channelName = channelName.substring(0, 100); // Limita o nome a 100 caracteres
            }

            // Encontre a categoria onde o canal será criado (substitua pelo ID da sua categoria)
            const categoryId = '1208211155353468950'; // Substitua com o ID da categoria

            try {
                // Criar o canal de texto dentro da categoria especificada
                const category = await interaction.guild.channels.fetch(categoryId);
                if (!category) {
                    await interaction.reply({ content: 'Categoria não encontrada!', ephemeral: true });
                    return;
                }

                const channel = await interaction.guild.channels.create({
                    name: channelName,
                    type: 0, // Tipo de canal de texto
                    parent: category.id,
                    topic: 'Aba de farm exclusiva!',
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel], // Não pode ver o canal
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel], // O dono do canal pode ver o canal
                        },
                        {
                            id: ALLOWED_ROLE_ID,
                            allow: [PermissionsBitField.Flags.ViewChannel], // O cargo específico pode ver o canal
                        },
                    ],
                });

                // Embed para a mensagem de confirmação
                const embed = new EmbedBuilder()
                    .setColor('#FF9800') // Cor laranja para a mensagem de sucesso
                    .setTitle('Canal de Farm Criado!')
                    .setDescription(`Seu canal de farm foi criado com sucesso! Acesse o canal: <#${channel.id}>`)
                    .setTimestamp();

                await interaction.reply({
                    embeds: [embed], // Inclui o embed com a mensagem
                    ephemeral: true, // A mensagem será visível apenas para o usuário
                });

                // Enviar uma mensagem inicial para o canal criado
                await channel.send(`Bem-vindo ao seu canal de farm, ${interaction.member.nickname}!
Registre todo o seu farm aqui para que a gerência de farm possa validar para o pagamento.
    

**METAS DA SEMANA – FIQUEM ATENTOS!**

Membros: 
Meta: 3k flor de skunk +  400k SUJO. 
Pagamento: 200k a cada meta alcançada.

Regras Gerais:
O cumprimento das metas será rigorosamente avaliado.
Qualquer falha ou atraso poderá impactar no pagamento, resultar em rebaixamento/ADV.
Para ser elegível a uma promoção de cargo, é obrigatório ter três semanas de Farm concluída com sucesso.
Mantenham-se organizados e reportem os resultados semanalmente na sua aba do Discord (caso não tenha aba é bom abrir).

Dúvidas ou informações adicionais?
Entre em contato com a Gerência`);

            } catch (error) {
                console.error("Erro ao criar o canal de farm:", error);
                await interaction.reply({ content: `Erro ao tentar criar o canal de farm. Detalhes: ${error.message}`, ephemeral: true });
            }
        }
    }

    if (interaction.isCommand() && interaction.commandName === 'createfarm') {
        const button = new ButtonBuilder()
            .setCustomId('create_farm')
            .setLabel('Criar Canal de Farm')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        // Embed para a mensagem inicial
        const embed = new EmbedBuilder()
            .setColor('#FF9800') // Cor laranja para a mensagem
            .setTitle('ABA DE FARM')
            .setDescription('Clique no botão abaixo para criar sua aba de farm exclusiva.')
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed], // Usando embed para a mensagem de instrução
            components: [row], // Inclui o botão de ação
        });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
