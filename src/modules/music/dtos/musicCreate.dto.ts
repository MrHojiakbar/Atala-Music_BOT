import { ApiProperty } from "@nestjs/swagger"
import { MusicGenres } from "../enums"
import {IsEnum, IsOptional, IsString} from 'class-validator'

export class CreateMusicDto{
    @IsString()
    @ApiProperty({name:"name",example:'tokyo'})
    name:string

    @IsString()
    @ApiProperty({name:"url",example:'uploads/music/tokyo'})
    url:string

    @IsString()
    @IsOptional()
    @ApiProperty({name:"author",example:'Shi Xyu'})
    author?:string

    @IsEnum(MusicGenres)
    @IsOptional()
    @ApiProperty({name:"genre",example:'ROCK'})
    genre?:MusicGenres

    @IsString()
    @ApiProperty({name:"uploaded_by",example:'507f191e810c19729de860ea'})
    uploaded_by:string
}