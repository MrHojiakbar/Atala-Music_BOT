import { HttpService } from '@nestjs/axios';
import { Command, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import { get } from 'node:http';
import { join, resolve } from 'node:path';
import { sendPlaylistPage } from 'src/helpers';
import { sendYouTubeResults } from 'src/helpers/sendYoutubeM.helper';
import { MusicDislikeService } from 'src/modules/dislike/dislike.service';
import { MusicLikeService } from 'src/modules/like/like.service';
import { MusicGenres } from 'src/modules/music/enums';
import { MusicService } from 'src/modules/music/music.service';
import { PLaylistService } from 'src/modules/playlist';
import { UserService, YOUTUBEuserID } from 'src/modules/user';
import { Markup, Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

type MyContext = Scenes.SceneContext;

@Update()
export class BotUpdate {
  constructor(
    private readonly userService: UserService,
    private readonly playlistService: PLaylistService,
    private readonly musicService: MusicService,
    private readonly likeService: MusicLikeService,
    private readonly dislikeService: MusicDislikeService,
    private readonly httpService: HttpService,
  ) {}
  @Start()
  async Start(
    @Ctx() ctx: MyContext & { session: { isLoggedIn: boolean; user } },
  ) {
    ctx.session.isLoggedIn = false;
    const username: any = ctx.message?.from?.username;
    const getUserByUsername: any =
      await this.userService.getByUserName(username);
    if (getUserByUsername.data) {
      ctx.session.isLoggedIn = true;
      ctx.session.user = {
        _id: getUserByUsername.data._id,
        username: getUserByUsername.data.username,
      };
      ('this user already login');
    }

    const imagePath = join(
      process.cwd(),
      'static',
      'images',
      'atala-music.png',
    );
    const user: any = ctx.message?.chat;
    await ctx.replyWithPhoto(
      { source: fs.readFileSync(imagePath) },
      {
        caption: `Hi👋 ${user.first_name}, Welcome to Atala-Music! 🎶\nPossible Commands 👇:
    /start – Start the bot  
    /search – name Search for a song  
    /genre – Browse by genre  
    /popular - Get popular songs
    /register – Register account
    /myplaylist – View your personal playlist  
    /addtoplaylist– name Add a song to your playlist  
    /playlist – user View another user’s playlist  
    /help – Show this help message`,
      },
    );
    if (!ctx.session.isLoggedIn) {
      await ctx.reply('Register to unlock more features! 😉👇\n/register');
    }
  }

  @Help()
  async help(@Ctx() ctx: MyContext) {
    await ctx.reply(`🆘 Help Menu:

You can control me using the following commands:

/start – Start the bot  
/search – name Search for a song  
/genre – Browse by genre  
/popular - Get popular songs
/register – Register account
/myplaylist – View your personal playlist  
/addtoplaylist– name Add a song to your playlist  
/playlist – user View another user’s playlist  
/help – Show this help message`);
  }

  @Command('addtoplaylist')
  async startAddToPlaylist(
    @Ctx() ctx: MyContext & { message: { text: string } },
  ) {
    const message = ctx.message;
    const playlistName: string = message.text.split(' ').slice(1).join(' ');
    if (!playlistName) {
      ctx.reply('❗ Please give playlist name.\nExample: /addtoplaylist Enjoy');
      return;
    }
    await ctx.scene.enter('add-to-playlist', { playlistName });
  }
  @Command('register')
  async register(@Ctx() ctx: MyContext & { session: any }) {
    const username: any = ctx.message?.from?.username;

    const getUserByUsername: any =
      await this.userService.getByUserName(username);
    if (getUserByUsername.data) {
      ctx.session.isLoggedIn = true;
      ctx.session.user = {
        _id: getUserByUsername.data._id.toString(),
        username: getUserByUsername.data.username,
      };

      ctx.reply('✅ You are already registered. Logged in successfully.');
      return;
    }
    ctx.session.tempUser = { username };
    ctx.scene.enter('register');
  }
  @Command('myplaylist')
  async getUserPlaylisr(@Ctx() ctx: MyContext & { session: any }) {
    const userId = ctx.session.user._id.toString();
    if (!userId) {
      await ctx.reply('Register to unlock this command! 😉👇\n/register');
      return;
    }
    userId;
    const getUser = await this.userService.getById(userId);

    const getUserPlaylists = getUser.data?.playlist_id;
    if (!getUserPlaylists) {
      await ctx.reply(
        'Your playlists is empty. Add songs with /addtoplaylist command.',
      );
      return;
    }
    ctx.session.playlistPage = 1;

    sendPlaylistPage(ctx as any, getUserPlaylists as any, 1);

    return;
  }

  @Command('genre')
  async getMusicByGenre(@Ctx() ctx: MyContext) {
    const buttons = Object.keys(MusicGenres).map((value) =>
      Markup.button.callback(value, `genre_music_${value}`),
    );

    await ctx.reply(
      'What genre of songs do you like? Choose the one 😊👇',
      Markup.inlineKeyboard(buttons.map((btn) => [btn])),
    );
  }

  @Command('playlist')
  async getPlaylistUser(@Ctx() ctx: MyContext) {
    const message: any = ctx.message;

    const username: string = message.text.split(' ')[1];
    if (!username) {
      ctx.reply('Please give username! Example: /playlist foo12 ');
      return;
    }
    const { data } = await this.userService.getByUserName(username);
    let playlists: any = data?.playlist_id;
    if (playlists === null || playlists == '') {
      ctx.reply('This user not registered or dont have playlist');
      return;
    }
    sendPlaylistPage(ctx as any, data?.playlist_id as any, 1);
    return;
  }

  @Command('search')
  async searchMusic(@Ctx() ctx: MyContext & { message: any }) {
    const searchText = ctx.message.text.split(' ').slice(1).join(' ');
    if (!searchText) {
      await ctx.reply('Please give music name for search !❌');
      return;
    }
    await sendYouTubeResults(ctx, searchText, this.httpService);
  }
  @Command('popular')
  async getPopularMusics(@Ctx() ctx: MyContext) {
    const musics = await this.musicService.getTopRatedMusics();
    if (!musics || musics.length == 0) {
      ctx.reply('Popular Musics is empty!');
      return;
    }
    let page = 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
      if (ctx.callbackQuery?.message?.message_id) {
        await ctx.telegram.deleteMessage(
          (ctx as any).chat.id,
          ctx.callbackQuery.message.message_id,
        );
      }
    } catch (err) {
      console.error('❌ deleteMessage error:', err);
    }

    let message = `🎵 Music In Popular Songs (Page ${page})\n\n`;
    let buttons: { text: string; callback_data: string }[][] = [[]];

    const paginatedMusics = musics.slice(offset, offset + limit);
    let count = offset + 1;

    for (const musicId of paginatedMusics) {
      const { data: musicData } =
        await this.musicService.getOneByIdMusic(musicId);
      message += `${count}. ${musicData?.name}\n`;
      buttons[0].push({
        text: String(count),
        callback_data: `music_id_${musicData?._id}`,
      });
      count++;
    }

    let navigationButtons: { text: string; callback_data: string }[] = [];
    if (page > 1) {
      navigationButtons.push({
        text: '⬅️ Previous',
        callback_data: `popular_${page - 1}`,
      });
    }
    if (offset + limit < musics.length) {
      navigationButtons.push({
        text: 'Next ➡️',
        callback_data: `popular_${page + 1}`,
      });
    }
    if (navigationButtons.length > 0) {
      buttons.push(navigationButtons);
    }

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
  @On('callback_query')
  async onCallbackQuery(
    @Ctx() ctx: MyContext & { callbackQuery: any; session: any },
  ) {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('playlist_page_')) {
      const page = parseInt(data.split('_').pop());
      const userId = ctx.session?.user?._id;

      if (!userId) {
        await ctx.answerCbQuery('Please register first.');
        return;
      }

      const user = await this.userService.getById(userId);
      const playlists = user.data?.playlist_id;

      if (!playlists || playlists.length === 0) {
        await ctx.answerCbQuery('No playlists found.');
        return;
      }

      await ctx.answerCbQuery();

      sendPlaylistPage(ctx as any, playlists, page);
    }
    if (data.startsWith('playlist_id')) {
      const [__, _, playlistId, pageNum] = data.split('_');
      let page = Number(pageNum || 1);
      const limit = 5;
      const offset = (page - 1) * limit;

      const playlist = await this.playlistService.getOneById(playlistId);
      const musics = playlist.data?.music_id;

      if (!musics || musics.length === 0) {
        await ctx.reply('In this Playlist not found musics!');
        return;
      }

      // 🔻 Oldingi xabarni o‘chirishga urinish
      try {
        if (ctx.callbackQuery?.message?.message_id) {
          await ctx.telegram.deleteMessage(
            (ctx as any).chat.id,
            ctx.callbackQuery.message.message_id,
          );
        }
      } catch (err) {
        console.error('❌ deleteMessage error:', err);
      }

      let message = `🎵 Music In Playlist *${playlist.data?.name}* (Page ${page})\n\n`;
      let buttons: { text: string; callback_data: string }[][] = [[]];

      const paginatedMusics = musics.slice(offset, offset + limit);
      let count = offset + 1;

      for (const musicId of paginatedMusics) {
        const { data: musicData } =
          await this.musicService.getOneByIdMusic(musicId);
        message += `${count}. ${musicData?.name}\n`;
        buttons[0].push({
          text: String(count),
          callback_data: `music_id_${musicData?._id}`,
        });
        count++;
      }

      let navigationButtons: { text: string; callback_data: string }[] = [];
      if (page > 1) {
        navigationButtons.push({
          text: '⬅️ Previous',
          callback_data: `playlist_id_${playlistId}_${page - 1}`,
        });
      }
      if (offset + limit < musics.length) {
        navigationButtons.push({
          text: 'Next ➡️',
          callback_data: `playlist_id_${playlistId}_${page + 1}`,
        });
      }
      if (navigationButtons.length > 0) {
        buttons.push(navigationButtons);
      }

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }
    if (data.startsWith('music_id')) {
      const userId = ctx.session?.user?._id;

      if (!userId) {
        await ctx.reply('Register to unlock this command! 😉👇\n/register');
        return;
      }
      const musicId = data.split('_').pop();
      const { data: music } = await this.musicService.getOneByIdMusic(musicId);
      ctx.replyWithAudio(
        { source: fs.createReadStream(music?.url as any) },
        {
          title: music?.name,
          reply_markup: {
            inline_keyboard: [
              [
                Markup.button.callback('Like 👍', `like_${musicId}_${userId}`),
                Markup.button.callback(
                  'Dislike 👎',
                  `dislike_${musicId}_${userId}`,
                ),
              ],
              [
                Markup.button.callback(
                  'Add to Playlist 🗂️',
                  `addplaylist_${musicId}_${userId}`,
                ),
              ],
            ],
          },
        },
      );
    }
    if (data.startsWith('genre_music')) {
      const genre = data.split('_').pop();
      const { data: musics } = await this.musicService.getByGenre(genre);
      const page = 1;
      const pageSize = 5;
      const totalPages = Math.ceil(musics.length / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentlyMusic = musics.slice(startIndex, endIndex);

      let message = `🎵 Music (Page ${page}/${totalPages}):\n`;
      currentlyMusic.forEach((music, i) => {
        message += `${startIndex + i + 1}. ${music.name}\n`;
      });

      const buttons: InlineKeyboardButton[][] = [[], []];

      if (page > 1) {
        buttons[1].push({
          text: '⬅️ Previous',
          callback_data: `music_page_${page - 1}`,
        });
      }

      currentlyMusic.forEach((music, i) => {
        buttons[0].push({
          text: `${i + 1}`,
          callback_data: `music_id_${String(music._id)}`,
        });
      });

      if (page < totalPages) {
        buttons[1].push({
          text: 'Next ➡️',
          callback_data: `music_page_${page + 1}`,
        });
      }

      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }
    if (data.startsWith('like_')) {
      const [_, music_id, user_id] = data.split('_');

      if (user_id == 'undefined') {
        await ctx.reply('Register to unlock this command! 😉👇\n/register');
        return;
      }
      const { data: music } = await this.musicService.getOneByIdMusic(music_id);
      await this.likeService.create({ music_id, user_id });
      await ctx.reply(`You liked music ${music?.name} ❤️`);
    }
    if (data.startsWith('dislike_')) {
      const [_, music_id, user_id] = data.split('_');

      if (user_id == 'undefined') {
        await ctx.reply('Register to unlock this command! 😉👇\n/register');
        return;
      }
      const { data: music } = await this.musicService.getOneByIdMusic(music_id);
      await this.dislikeService.create({ music_id, user_id });
      await ctx.reply(`You disliked music ${music?.name} 👎`);
    }
    if (data.startsWith(`addplaylist_id_`)) {
      const parts = data.split('_');
      ('keldi');

      if (parts.length !== 4) {
        await ctx.answerCbQuery('Invalid data format.');
        return;
      }
      const music_id = parts[2];
      const playlist_id = parts[3];

      const { data: playlist } =
        await this.playlistService.getOneById(playlist_id);

      if (!playlist) {
        await ctx.answerCbQuery('Playlist not found.');
        return;
      }

      if (!playlist.music_id) {
        playlist.music_id = [];
      }
      if (!playlist.music_id.includes(music_id)) {
        playlist.music_id.push(music_id);
      } else {
        await ctx.answerCbQuery('This music is already in the playlist.');
        return;
      }

      if (typeof playlist.save === 'function') {
        await playlist.save();
      } else {
        await this.playlistService.update(playlist_id, {
          music_id: playlist.music_id as any,
        });
      }

      await ctx.answerCbQuery();
      await ctx.reply(
        `Music successfully saved to your playlist "${playlist.name}" ✅`,
      );
      return;
    }
    if (data.startsWith('addplaylist_')) {
      const [_, music_id, userId] = data.split('_');

      if (userId == 'undefined') {
        await ctx.reply('Register to unlock this command! 😉👇\n/register');
        return;
      }

      const { data: getUser } = await this.userService.getById(userId);
      if (!getUser) {
        await ctx.reply('Register to unlock this command! 😉👇\n/register');
        return;
      }
      const playlists: any = getUser.playlist_id;
      if (!playlists) {
        await ctx.reply(
          'Your playlists is empty. Add songs with /addtoplaylist command.',
        );
        return;
      }
      const page = 1;

      const pageSize = 5;
      const totalPages = Math.ceil(playlists.length / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPlaylists = playlists.slice(startIndex, endIndex);
      currentPlaylists;

      let message = `🎵 Playlists (Page ${page}/${totalPages}):\n`;
      currentPlaylists.forEach((pl, i) => {
        message += `${startIndex + i + 1}. ${pl.name}\n`;
      });

      const buttons: InlineKeyboardButton[][] = [[], []];

      if (page > 1) {
        buttons[1].push({
          text: '⬅️ Previous',
          callback_data: `playlist_page_${page - 1}`,
        });
      }

      currentPlaylists.forEach((pl, i) => {
        buttons[0].push({
          text: `${i + 1}`,
          callback_data: `addplaylist_id_${music_id}_${String(pl._id)}`,
        });
      });

      if (page < totalPages) {
        buttons[1].push({
          text: 'Next ➡️',
          callback_data: `playlist_page_${page + 1}`,
        });
      }

      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }

    if (data.startsWith('select_')) {
      data;

      let [_, video_id, video_index, userId] = data.split('_');
      video_index = Number(video_index);
      try {
        await ctx.answerCbQuery('⏳ Downloading audio... Please wait', {
          show_alert: true,
        });

        const musicPath = join(process.cwd(), 'uploads', 'music');
        if (!fs.existsSync(musicPath)) {
          fs.mkdirSync(musicPath, { recursive: true });
        }
        const musicTitle =
          ctx.session.youTubeResults[video_index].snippet.title || 'Unknown';
        const outputPath = resolve(musicPath, `${video_id}-${Date.now()}.mp3`);
        const user_id = userId;

        const { data: foundedMusic } =
          await this.musicService.getByName(musicTitle);
        if (foundedMusic) {
          ctx.replyWithAudio(
            { source: fs.createReadStream(foundedMusic?.url as any) },
            {
              title: foundedMusic.name,
              reply_markup: {
                inline_keyboard: [
                  [
                    Markup.button.callback(
                      'Like 👍',
                      `like_${foundedMusic._id}_${user_id}`,
                    ),
                    Markup.button.callback(
                      'Dislike 👎',
                      `dislike_${foundedMusic._id}_${user_id}`,
                    ),
                  ],
                  [
                    Markup.button.callback(
                      'Add to Playlist 🗂️',
                      `addplaylist_${foundedMusic._id}_${user_id}`,
                    ),
                  ],
                ],
              },
            },
          );
        } else {
          const { data: newMusic } = await this.musicService.createMusic({
            url: outputPath,
            uploaded_by: YOUTUBEuserID,
            name: musicTitle,
          });

          await new Promise((resolve, reject) => {
            exec(
              `yt-dlp -x --audio-format mp3 -o "${outputPath}" "https://www.youtube.com/watch?v=${video_id}"`,
              { timeout: 120000 },
              (error, stdout, stderr) => {
                if (error) {
                  console.error('Download error:', error);
                  console.error('stderr:', stderr);
                  reject(error);
                  return;
                }
                resolve(stdout);
              },
            );
          });

          if (!fs.existsSync(outputPath)) {
            throw new Error('Audio file not created');
          }

          await ctx.replyWithAudio(
            { source: fs.createReadStream(outputPath) },
            {
              title: musicTitle,
              caption: `The world is more beautiful with @AtalaMusicBot 👍`,
              reply_markup: {
                inline_keyboard: [
                  [
                    Markup.button.callback(
                      'Like 👍',
                      `like_${newMusic._id}_${user_id}`,
                    ),
                    Markup.button.callback(
                      'Dislike 👎',
                      `dislike_${newMusic._id}_${user_id}`,
                    ),
                  ],
                  [
                    Markup.button.callback(
                      'Add to Playlist 🗂️',
                      `addplaylist_${newMusic._id}_${user_id}`,
                    ),
                  ],
                ],
              },
            },
          );
        }
      } catch (error) {
        console.error('Audio download error:', error);
        await ctx.answerCbQuery('❌ Failed to download audio');
        await ctx.reply(
          'Sorry, there was an error downloading the audio. Please try again later.',
        );

        const tempFile = resolve(
          __dirname,
          '..',
          '..',
          'temp',
          `${video_id}.mp3`,
        );
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    }
    if (data.startsWith('navigate_')) {
      const [_, query, pageToken, ds] = data.split('_');
      await sendYouTubeResults(
        ctx as any,
        query,
        this.httpService,
        pageToken,
        ds,
      );
    }
    if (data.startsWith('popular_')) {
      const [_, pageNum] = data.split('_');
      const musics = await this.musicService.getTopRatedMusics();
      if (!musics || musics.length == 0) {
        ctx.reply('Popular Musics is empty!');
        return;
      }
      let page = Number(pageNum || 1);
      const limit = 5;
      const offset = (page - 1) * limit;

      try {
        if (ctx.callbackQuery?.message?.message_id) {
          await ctx.telegram.deleteMessage(
            (ctx as any).chat.id,
            ctx.callbackQuery.message.message_id,
          );
        }
      } catch (err) {
        console.error('❌ deleteMessage error:', err);
      }

      let message = `🎵 Music In Popular Songs (Page ${page})\n\n`;
      let buttons: { text: string; callback_data: string }[][] = [[]];

      const paginatedMusics = musics.slice(offset, offset + limit);
      let count = offset + 1;

      for (const musicId of paginatedMusics) {
        const { data: musicData } =
          await this.musicService.getOneByIdMusic(musicId);
        message += `${count}. ${musicData?.name}\n`;
        buttons[0].push({
          text: String(count),
          callback_data: `music_id_${musicData?._id}`,
        });
        count++;
      }

      let navigationButtons: { text: string; callback_data: string }[] = [];
      if (page > 1) {
        navigationButtons.push({
          text: '⬅️ Previous',
          callback_data: `popular_${page - 1}`,
        });
      }
      if (offset + limit < musics.length) {
        navigationButtons.push({
          text: 'Next ➡️',
          callback_data: `popular_${page + 1}`,
        });
      }
      if (navigationButtons.length > 0) {
        buttons.push(navigationButtons);
      }

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }
  }
}
