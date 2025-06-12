import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from './model';
import { CreateMusicLikeDto } from './dtos';


@Injectable()
export class MusicLikeService {
  constructor(
    @InjectModel(Like.name)
    private musicLikeModel: Model<Like>,
  ) {}

  async create(createDto: CreateMusicLikeDto): Promise<Like> {
    const existing = await this.musicLikeModel.findOne({
      music_id: createDto.music_id,
      user_id: createDto.user_id,
    });

    if (existing) {
      return existing;
    }

    const created = new this.musicLikeModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Like[]> {
    return this.musicLikeModel.find();
  }

  async findByUser(userId: string): Promise<Like[]> {
    return this.musicLikeModel.find({ user_id: userId });
  }

  async remove(musicId: string, userId: string): Promise<{ deleted: boolean }> {
    const res = await this.musicLikeModel.deleteOne({ music_id: musicId, user_id: userId });
    return { deleted: res.deletedCount > 0 };
  }
}
