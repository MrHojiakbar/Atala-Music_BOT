import { MusicGenres } from "../enums"
import {IsEnum, IsString} from 'class-validator'

export class CreateMusicDto{
    @IsString()
    name:string

    @IsString()
    url:string

    @IsString()
    author:string

    @IsEnum(MusicGenres)
    genre:MusicGenres

    @IsString()
    uploaded_by:string
}