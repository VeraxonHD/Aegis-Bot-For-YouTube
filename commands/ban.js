module.exports = {
    name: "ban",
    description: "Bans a user from the guild.",
    alias: [],
    usage: "ban <userid/mention> [reason]",
    permissions: "BAN_MEMBERS",
    execute(message, args, client) {
        var Discord = require("discord.js");
        var config = require("../config.json");
        var mainfile = require("../aegis.js");
        var moderator = message.author.tag;
        var util = require("../returndata.js");
        var tgtmember;
        var snowflakeRegexTest = new RegExp("([0-9]{18})");
        if(!args[0]){
            return util.missingArgumentsEmbed(message.channel, "Ban", "User ID or Mention", "First, followed by an optional ban reason.")
        }
            if(args[0].length == 18 && snowflakeRegexTest.test(args[0])){
                tgtmember = message.guild.members.cache.get(args[0]);
            }else if(message.mentions.users.first()){
                tgtmember = message.mentions.members.first();
            }else{
                return util.userNotFound(message.channel, args[0]);
            }

        if(!message.member.hasPermission("BAN_MEMBERS")){
            return util.invalidPermissions(message.channel, "ban", "BAN_MEMBERS")
        }else if(tgtmember.bannable == false){
            return message.reply("You cannot ban that user.")
        }
        var reason = args.slice(1).join(" ");
        if(!reason){
            reason = "No reason supplied."
        }

        var logchannel = message.guild.channels.cache.get(config[message.guild.id].logchannels.moderator)
            if(!logchannel){
                logchannel = message.guild.channels.cache.get(config[message.guild.id].logchannels.default)
                if(!logchannel){
                    return message.channel.send("You do not have a logchannel configured. Contact your server owner.")
                }
            }

        function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXY0123456789";
              
            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
              
            return text;
        }
        var currentcaseid = makeid();

        message.reply(`Success! ${tgtmember.user.tag} was successfully banned from ${message.guild.name}. <:banhammer:722877640201076775>`);
        tgtmember.ban({days: 7, reason: reason});
        
        const embed = new Discord.MessageEmbed()
                .addField("User ID", tgtmember.id)
                .addField("Added by", moderator)
                .addField("Reason", reason)
                .setTimestamp(new Date())
                .setFooter("AEGIS-BAN Command | Case ID: " + currentcaseid)
                .setColor("#00C597")
            logchannel.send(`Ban log for **${tgtmember.user.tag}** - Case ID **${currentcaseid}**`, {embed})

        var evidencedb = mainfile.sendEvidenceDB();
        if(message.attachments.size > 0){
            message.attachments.forEach(element => {
                const attatchembed = new Discord.MessageEmbed()
                    .setAuthor(`Evidence For Case ${currentcaseid}`)
                    .setImage(element.url)
                    .setFooter(`AEGIS-BAN-EVIDENCE Event | Case ID: ${currentcaseid}`)
                logchannel.send(`Ban evidence for **${tgtmember.tag}** - Case ID **${currentcaseid}**`, {embed: attatchembed})
                
                evidencedb.create({
                    userid: tgtmember.id,
                    CaseID: currentcaseid,
                    typeOf: "BAN",
                    dateAdded: message.createdTimestamp,
                    evidenceLinks: element.url,
                    reason: reason
                })
            });   
        }else{
            evidencedb.create({
                userid: tgtmember.id,
                CaseID: currentcaseid,
                typeOf: "BAN",
                dateAdded: message.createdTimestamp,
                evidenceLinks: "No Evidence",
                reason: reason
            })
        }
    }
};