// app.module.ts
import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Music, MusicSchema } from './model/music.model';
import { MusicController } from './music.controller';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Music.name, schema: MusicSchema }]), 
  ],
  controllers:[MusicController],
  providers: [MusicService],
  exports:[MusicService]
})
export class MusicModule {}
