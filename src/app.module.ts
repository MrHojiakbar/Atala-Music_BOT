// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session, Scenes } from 'telegraf';
import { BotModule } from './bot/bot.module';
import { AddToPlaylistScene } from './bot/Scenes/add-to-playlist.scene';

const stage = new Scenes.Stage<Scenes.SceneContext>([new AddToPlaylistScene()]);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN!,
      middlewares: [session(), stage.middleware()],
    }),
    BotModule,
  ],
  providers: [AddToPlaylistScene], 
})
export class AppModule {}
