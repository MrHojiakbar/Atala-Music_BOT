import { Scene, SceneEnter, On, Ctx } from 'nestjs-telegraf';
import { saveAudioFile, toValidObjectId } from 'src/helpers';
import { MusicService } from 'src/modules/music/music.service';
import { PLaylistService } from 'src/modules/playlist';
import { MyContext } from 'src/types';
import { Scenes } from 'telegraf';

@Scene('add-to-playlist')
export class AddToPlaylistScene extends Scenes.BaseScene<MyContext> {
  constructor(private readonly musicService: MusicService,private readonly playlistService:PLaylistService) {
    super('add-to-playlist'); 
  }

  @SceneEnter()
  async onEnter(@Ctx() ctx: MyContext) {
    await ctx.reply('🎵 Please send me the song name you want to add:');
  }

  @On('audio')
  async onAudio(@Ctx() ctx: MyContext & {scene:{state:{playlistName}}} ) {
    try {
      const audio:any = ctx.message.audio;
      const playlistName = ctx.scene.state.playlistName;
      if (audio.file_size >= 10 * 1024 * 1024) {
        await ctx.reply('❌ Music max size is 10 MB');
        return;
      }
      
      await ctx.reply('📥 Music being saved ...');
      const fileId = audio.file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const newMusic = await saveAudioFile(fileId, fileLink.href);
      let userId=((ctx.session as any).user._id).toString()
      const createdMusic=await this.musicService.createMusic({name:(audio.title as string),url:(newMusic as any).filePath,uploaded_by:userId})
      let musicId:any=((await createdMusic).data._id).toString()
      const createdPlaylist=await this.playlistService.create({name:playlistName,user_id:userId,music_id:[musicId]})
      console.log(createdMusic);
      console.log(createdPlaylist);
      
      await ctx.reply(`✅ ${audio.title} has been added to your playlist: ${playlistName}.`);
      await ctx.scene.leave();
    } catch (err) {
      await ctx.reply('Sorry, server error occurred. Please wait 5 minutes and try again.');
      console.error(err);
    }
  }
}
