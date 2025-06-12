import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dislike } from './model';
import { CreateMusicDislikeDto } from './dtos';


@Injectable()
export class MusicDislikeService {
  constructor(
    @InjectModel(Dislike.name)
    private musicDislikeModel: Model<Dislike>,
  ) {}

  async create(createDto: CreateMusicDislikeDto): Promise<Dislike> {
    const existing = await this.musicDislikeModel.findOne({
      music_id: createDto.music_id,
      user_id: createDto.user_id,
    });

    if (existing) {
      return existing;
    }

    const created = new this.musicDislikeModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Dislike[]> {
    return this.musicDislikeModel.find();
  }

  async findByUser(userId: string): Promise<Dislike[]> {
    return this.musicDislikeModel.find({ user_id: userId });
  }

  async remove(musicId: string, userId: string): Promise<{ deleted: boolean }> {
    const res = await this.musicDislikeModel.deleteOne({ music_id: musicId, user_id: userId });
    return { deleted: res.deletedCount > 0 };
  }
}
