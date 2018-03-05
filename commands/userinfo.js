module.exports = {
    name: "userinfo",
    description: "Fetches information from the database on a specific user.",
    alias: ["ui", "info"],
    usgae: "userinfo <user>",
    permissions: "MANAGE_MESSAGES",
    execute(message, args, client) {
        var mainfile = require("../aegis.js");
        var df = require("dateformat")
        var Discord = require("discord.js")

        var member;
            if(args[0].length == 18){
                member = message.guild.members.get(args[0])
            }else if(message.mentions.users.first()){
                member = message.mentions.users.first();
            }else{
                return message.reply("User not found, use their ID or mention.");
            }

        var database = mainfile.sendDB();
        database.findOne({where:{userid: member.id}}).then(row => {
            var data = {
                "messagecount": row.messagecount,
                "lsChannel": row.lastSeenChan,
                "lsGuild": row.lastSeenGuild,
                "lsTime": row.lastSeenTS,
                "warnings": row.warnings,
                "accCreation": row.accCreationTS,
                "userid": row.userid
            }
            const embed = new Discord.RichEmbed()
                .addField("UserID", data.userid)
                .addField("Message Count", data.messagecount)
                .addField("Warning Count", data.warnings)
                .addField("Last Seen", `At: ${df(data.lsTime, "dd/mm/yyyy, hh:MM:ss")}\nIn: ${data.lsGuild} (#${data.lsChannel})`)
                .setColor("#00C597")
                .setFooter("AEGIS-USERINFO Command")
                .setTimestamp(new Date())
            message.channel.send(`Userinfo for **${args[0]}**`, {embed})
        })
    }
};