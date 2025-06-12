import { Scene, SceneEnter, On, Ctx } from 'nestjs-telegraf';
import { saveAudioFile, toValidObjectId } from 'src/helpers';
import { MusicService } from 'src/modules/music/music.service';
import { PLaylistService } from 'src/modules/playlist';
import { UserService } from 'src/modules/user';
import { MyContext } from 'src/types';
import { Scenes } from 'telegraf';

@Scene('add-to-playlist')
export class AddToPlaylistScene extends Scenes.BaseScene<MyContext> {
  constructor(
    private readonly musicService: MusicService,
    private readonly playlistService: PLaylistService,
    private readonly userService: UserService,
  ) {
    super('add-to-playlist');
  }

  @SceneEnter()
  async onEnter(@Ctx() ctx: MyContext) {
    await ctx.reply('🎵 Please send me the song name you want to add:');
  }

  @On('audio')
  async onAudio(
    @Ctx() ctx: MyContext & { scene: { state: { playlistName } } },
  ) {
    try {
      const audio: any = ctx.message.audio;
      console.log(audio);
      
      const playlistName = ctx.scene.state.playlistName;
      if (audio.file_size >= 10 * 1024 * 1024) {
        await ctx.reply('❌ Music max size is 10 MB');
        return;
      }

      await ctx.reply('📥 Music being saved ...');
      const fileId = audio.file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const newMusic = await saveAudioFile(fileId, fileLink.href);
      let userId = (ctx.session as any).user._id.toString();
      let { data } = await this.playlistService.getOneByName(
        playlistName,
        userId,
      );
      if (data) {
        const createdMusic = await this.musicService.createMusic({
          name: audio.title as string || audio.file_name.split('.')[0],
          url: (newMusic as any).filePath,
          uploaded_by: userId,
        });
        let musicId: any = (await createdMusic).data._id.toString();
        data.music_id.push(musicId);
        await this.playlistService.update(data._id.toString(), data as any);
      } else {
        console.log(audio.file_name.split('.')[0]);
        
        const createdMusic = await this.musicService.createMusic({
          name: audio.title as string || audio.file_name.split('.')[0],
          url: (newMusic as any).filePath,
          uploaded_by: userId,
        });
        let musicId: any = (await createdMusic).data._id.toString();
        const playlist = await this.playlistService.create({
          name: playlistName,
          user_id: userId,
          music_id: [musicId],
        });
        const foundedUser = await this.userService.getById(userId);
        const userPL = foundedUser.data?.playlist_id==null?[]:foundedUser.data?.playlist_id;
        userPL?.push(playlist.data._id.toString());
        await this.userService.update(userId, { playlist_id: userPL as any });
      }

      await ctx.reply(
        `✅ ${audio.title || audio.file_name.split('.')[0]} has been added to your playlist: ${playlistName}.`,
      );
      await ctx.scene.leave();
    } catch (err) {
      await ctx.reply(
        'Sorry, server error occurred. Please wait 5 minutes and try again.',
      );
      console.error(err);
    }
  }
}
