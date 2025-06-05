import { Scene, SceneEnter, On, Ctx } from 'nestjs-telegraf';
import { saveAudioFile } from 'src/helpers';
import { MyContext } from 'src/types';
import { Scenes } from 'telegraf';


@Scene('add-to-playlist')
export class AddToPlaylistScene extends Scenes.BaseScene<Scenes.SceneContext> {
    constructor() {
        super('add-to-playlist');
    }
    @SceneEnter()
    async onEnter(@Ctx() ctx: MyContext) {
        await ctx.reply('🎵 Please send me the song name you want to add:');
    }

    @On('audio')
    async onText(@Ctx() ctx: MyContext) {
        try {
            const songName: any = ctx.message;
            console.log(songName.audio);
            if ((ctx.message.audio.file_size as number)>=(7*1024*1024)) {
                ctx.reply('❌ Music max size is 7 MB')
                return;
            }
            ctx.reply('📥 Music being saved ...')
            
            const fileId: any = ctx?.message.audio.file_id;
            const fileLink = await ctx.telegram.getFileLink(fileId);
            await saveAudioFile(fileId, fileLink.href)
            await ctx.reply(`✅ ${songName.audio.title} has been added to your playlist.`);
            await ctx.scene.leave();
        } catch (err) {
            ctx.reply(`Sorry in server error you can wait 5 minute`)
            console.log(err);

        }
    }
}
