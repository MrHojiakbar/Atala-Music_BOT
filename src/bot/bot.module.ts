// bot.module.ts
import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicSchema } from 'src/modules/music/model/music.model';
import { AddToPlaylistScene } from './Scenes/add-to-playlist.scene';
import { UserModule } from 'src/modules/user/user.module';
import { RegisterScene } from './Scenes/register.scene';
import { MusicModule } from 'src/modules/music/music.module';
import { PLaylistService } from 'src/modules/playlist';
import { PlaylistModule } from 'src/modules/playlist/playlist.module';
import { LikeModule } from 'src/modules/like/like.module';
import { DislikeModule } from 'src/modules/dislike/dislike.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Music', schema: MusicSchema }]),
    MusicModule,
    UserModule,
    PlaylistModule,
    LikeModule,
    DislikeModule
  ],
  providers: [BotUpdate,AddToPlaylistScene,RegisterScene],
})
export class BotModule {}
