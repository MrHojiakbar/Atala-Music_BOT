import { Command, Ctx, Help, Start, Update } from "nestjs-telegraf";
import * as fs from "node:fs";
import { join } from "node:path";
import {Scenes} from 'telegraf'


type MyContext = Scenes.SceneContext;

@Update()
export class BotUpdate {
    constructor() { }

    @Start()
    async Start(@Ctx() ctx: MyContext) {
        const imagePath = join(process.cwd(), "static",'images', "atala-music.png")
        const user: any = ctx.message?.chat
        await ctx.replyWithPhoto({ source: fs.readFileSync(imagePath) }, {
            caption: `Hi👋 ${user.first_name}, Welcome to Atala-Music! 🎶\nPossible Commands 👇:
    /start – Start the bot  
    /search <name> – Search for a song  
    /genre – Browse by genre  
    /myplaylist – View your personal playlist  
    /addtoplaylist <name> – Add a song to your playlist  
    /playlist <user> – View another user’s playlist  
    /help – Get help`
        })
    }

    @Help()
    async help(@Ctx() ctx: MyContext) {
        await ctx.reply(`🆘 Help Menu:

You can control me using the following commands:

/start – Start the bot  
/search <name> – Search for a song  
/genre – Browse by genre  
/myplaylist – View your personal playlist  
/addtoplaylist <name> – Add a song to your playlist  
/playlist <user> – View another user’s playlist  
/help – Show this help message`);
    }

    @Command('addtoplaylist')
    async startAddToPlaylist(@Ctx() ctx: MyContext) {
        await ctx.scene.enter('add-to-playlist');
    }

}