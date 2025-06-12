import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session, Scenes } from 'telegraf';
import { BotModule } from './bot/bot.module';
import { AddToPlaylistScene } from './bot/Scenes/add-to-playlist.scene';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicModule } from './modules/music/music.module';
import { UserModule } from './modules/user/user.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { authMiddleware } from './bot';
import { LikeModule } from './modules/like/like.module';
import { DislikeModule } from './modules/dislike/dislike.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL as string),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN!,
      middlewares: [session(),authMiddleware],
      include: [BotModule], 
    }),
    BotModule,
    MusicModule,
    UserModule,
    PlaylistModule,
    LikeModule,
    DislikeModule
  ],
})
export class AppModule {}