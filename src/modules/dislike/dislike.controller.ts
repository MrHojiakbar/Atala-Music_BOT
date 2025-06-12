import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { MusicDislikeService } from './dislike.service';
import { CreateMusicDislikeDto } from './dtos';

@ApiTags('music-likes')
@Controller('music-likes')
export class MusicDislikeController {
  constructor(private readonly musicLikeService: MusicDislikeService) {}

  @Post()
  async create(@Body() createDto: CreateMusicDislikeDto) {
    return this.musicLikeService.create(createDto);
  }

  @Get()
  async findAll() {
    return this.musicLikeService.findAll();
  }

  @Get('by-user')
  @ApiQuery({ name: 'userId', required: true })
  async findByUser(@Query('userId') userId: string) {
    return this.musicLikeService.findByUser(userId);
  }

  @Delete()
  @ApiQuery({ name: 'musicId', required: true })
  @ApiQuery({ name: 'userId', required: true })
  async remove(
    @Query('musicId') musicId: string,
    @Query('userId') userId: string,
  ) {
    return this.musicLikeService.remove(musicId, userId);
  }
}
