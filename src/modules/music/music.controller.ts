import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateMusicDto, UpdateMusicDto } from './dtos';

@Controller('musics')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get()
  async getAll() {
    return this.musicService.getAllMusics();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const result = await this.musicService.getOneByIdMusic(id);
    if (!result.data) {
      throw new NotFoundException('Music not found');
    }
    return result;
  }

  @Post()
  async create(@Body() dto: CreateMusicDto) {
    return this.musicService.createMusic(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMusicDto) {
    const result = await this.musicService.updateMusic(id, dto);
    if (!result.data) {
      throw new NotFoundException('Music not found');
    }
    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.musicService.deleteMusic(id);
    if (!result.data) {
      throw new NotFoundException('Music not found');
    }
    return result;
  }
}
