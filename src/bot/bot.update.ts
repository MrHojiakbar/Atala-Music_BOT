import { Command, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { sendPlaylistPage } from 'src/helpers';
import { MusicDislikeService } from 'src/modules/dislike/dislike.service';
import { MusicLikeService } from 'src/modules/like/like.service';
import { MusicGenres } from 'src/modules/music/enums';
import { MusicService } from 'src/modules/music/music.service';
import { PLaylistService } from 'src/modules/playlist';
import { UserService } from 'src/modules/user';
import { Markup, Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

type MyContext = Scenes.SceneContext;

@Update()
export class BotUpdate {
  constructor(
    private readonly userService: UserService,
    private readonly playlistService: PLaylistService,
    private readonly musicService: MusicService,
    private readonly likeService:MusicLikeService,
    private readonly dislikeService:MusicDislikeService
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
      console.log('this user already login');
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
    /search <name> – Search for a song  
    /genre – Browse by genre  
    /register – Register account
    /myplaylist – View your personal playlist  
    /addtoplaylist <name> – Add a song to your playlist  
    /playlist <user> – View another user’s playlist  
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
/search <name> – Search for a song  
/genre – Browse by genre  
/register – Register account
/myplaylist – View your personal playlist  
/addtoplaylist <name> – Add a song to your playlist  
/playlist <user> – View another user’s playlist  
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
        _id: getUserByUsername.data._id,
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
    console.log(userId);
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
    console.log(message);

    const username: string = message.text.split(' ')[1];
    if (!username) {
      ctx.reply('Please give username! Example: /playlist foo12 ');
      return;
    }
    const { data } = await this.userService.getByUserName(username);
    let playlists: any = data?.playlist_id;
    console.log(data);
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
    const { data: musics } = await this.musicService.getByName(searchText);
    console.log(musics);

    const page = 1;
    const pageSize = 5;
    const totalPages = Math.ceil(musics.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentlyMusic = musics.slice(startIndex, endIndex);
    console.log(currentlyMusic);

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
      const playlistId = data.split('_').pop();
      const playlist = await this.playlistService.getOneById(playlistId);
      const musics = playlist.data?.music_id;

      if (!musics || musics.length === 0) {
        await ctx.reply('In this Playlist not found musics!');
        return;
      }

      await ctx.answerCbQuery();
      await ctx.deleteMessage();
      let message = `Music In Playlist ${playlist.data?.name}\n\n`;
      let buttons: { text: string; callback_data: string }[] = [];
      let count = 1;
      for (const musicId of musics) {
        const { data: musicData } =
          await this.musicService.getOneByIdMusic(musicId);
        message += `${count}. ${musicData?.name}\n`;
        buttons.push({
          text: String(count) || 'Unknown',
          callback_data: `music_id_${musicData?._id}`,
        });
        count += 1;
      }

      const inlineKeyboard = buttons.map((button) => [button]);
      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
    }
    if (data.startsWith('music_id')) {

      const userId = (ctx.session?.user?._id).toString();
      if (!userId) {
        await ctx.answerCbQuery('Please register first.');
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
                  `dislike_${musicId}_${userId}`
                ),
              ],
              [
                Markup.button.callback(
                  'Add to Playlist 🗂️',
                  `addplaylist_${musicId}_${userId}`
                ),
              ]
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
      console.log(currentlyMusic);

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
      const [_,music_id,user_id]=data.split('_')
      const {data:music}=await this.musicService.getOneByIdMusic(music_id)
      await this.likeService.create({music_id,user_id})
      await ctx.reply(`You liked music ${music?.name} ❤️`)
    }
    if (data.startsWith('dislike_')) {
      const [_,music_id,user_id]=data.split('_')
      const {data:music}=await this.musicService.getOneByIdMusic(music_id)
      await this.dislikeService.create({music_id,user_id})
      await ctx.reply(`You disliked music ${music?.name} 👎`)
    }
  }
}
