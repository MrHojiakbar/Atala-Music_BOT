import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { PLaylistService } from './playlist.service';
import { CreatePlaylistDto, UpdatePlaylistDto } from './dtos';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PLaylistService) {}

  @Get()
  async getAll() {
    return this.playlistService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const result = await this.playlistService.getOneById(id);
    if (!result.data) {
      throw new NotFoundException('Playlist not found');
    }
    return result;
  }

  @Post()
  async create(@Body() dto: CreatePlaylistDto) {
    return this.playlistService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto) {
    const result = await this.playlistService.update(id, dto);
    if (!result.data) {
      throw new NotFoundException('Playlist not found');
    }
    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.playlistService.delete(id);
    if (!result.data) {
      throw new NotFoundException('Playlist not found');
    }
    return result;
  }
}
