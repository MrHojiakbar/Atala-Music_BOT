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
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dtos';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll() {
    return this.userService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.userService.getById(id);
    if (!result.data) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const result = await this.userService.update(id, dto);
    if (!result.data) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.userService.delete(id);
    if (!result.data) {
      throw new NotFoundException('User not found');
    }
    return result;
  }
}
