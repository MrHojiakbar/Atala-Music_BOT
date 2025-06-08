import { Command, Ctx, Help, Start, Update } from "nestjs-telegraf";
import * as fs from "node:fs";
import { join } from "node:path";
import { UserService } from "src/modules/user";
import { Scenes } from 'telegraf';


type MyContext = Scenes.SceneContext;

@Update()
export class BotUpdate {
    constructor(private readonly userService:UserService) { }

    @Start()
    async Start(@Ctx() ctx: MyContext & {session:{isLoggedIn:boolean,user}}) {
        ctx.session.isLoggedIn = false;
        const username:any = ctx.message?.from?.username;
        const getUserByUsername:any = await this.userService.getByUserName(username);        
        if (getUserByUsername.data) {
            ctx.session.isLoggedIn = true;
            ctx.session.user = {
            _id: getUserByUsername.data._id,
            username: getUserByUsername.data.username,
            };
            console.log('this user already login');
            
        }
        

        const imagePath = join(process.cwd(), "static",'images', "atala-music.png")
        const user: any = ctx.message?.chat
        await ctx.replyWithPhoto({ source: fs.readFileSync(imagePath) }, {
            caption: `Hi👋 ${user.first_name}, Welcome to Atala-Music! 🎶\nPossible Commands 👇:
    /start – Start the bot  
    /search <name> – Search for a song  
    /genre – Browse by genre  
    /register – Register account
    /myplaylist – View your personal playlist  
    /addtoplaylist <name> – Add a song to your playlist  
    /playlist <user> – View another user’s playlist  
    /help – Show this help message`
        })
        if (!ctx.session.isLoggedIn) {
            await ctx.reply('Register to unlock more features! 😉👇\n/register')
        }
    }

    @Help()
    async help(@Ctx() ctx: MyContext) {
        await ctx.reply(`🆘 Help Menu:

You can control me using the following commands:

/start – Start the bot  
/search <name> – Search for a song  
/genre – Browse by genre  
/register – Register account
/myplaylist – View your personal playlist  
/addtoplaylist <name> – Add a song to your playlist  
/playlist <user> – View another user’s playlist  
/help – Show this help message`);
    }
    

    @Command('addtoplaylist')
    async startAddToPlaylist(@Ctx() ctx: MyContext & {message:{text:string}}) {
        const message=ctx.message
        const playlistName:string=message.text.split(" ").slice(1).join(" ")
        if (!playlistName) {
            ctx.reply("❗ Please give playlist name.\nExample: /addtoplaylist Enjoy");
            return;
        }
        await ctx.scene.enter('add-to-playlist',{playlistName});
    }
    @Command('register')
    async register(@Ctx() ctx: MyContext & { session: any }) {
        const username:any = ctx.message?.from?.username;

        const getUserByUsername:any = await this.userService.getByUserName(username);        
        if (getUserByUsername.data) {
            ctx.session.isLoggedIn = true;
            ctx.session.user = {
            _id: getUserByUsername.data._id,
            username: getUserByUsername.data.username,
            };
            ctx.reply("✅ You are already registered. Logged in successfully.");
            return;
        }
        ctx.session.tempUser = { username }; 
        ctx.scene.enter('register'); 
    }
}