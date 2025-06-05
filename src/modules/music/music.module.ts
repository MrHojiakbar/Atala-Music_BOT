// app.module.ts
import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Music, MusicSchema } from './model/music.model';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Music.name, schema: MusicSchema }]), 
  ],
  providers: [MusicService],
})
export class MusicModule {}
