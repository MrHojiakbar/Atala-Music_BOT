import { ApiProperty } from "@nestjs/swagger"
import {IsString} from 'class-validator'
import { ObjectId, Types } from "mongoose"

export class CreatePlaylistDto{
    @IsString()
    @ApiProperty({name:"name",example:'Enjoy'})
    name:string 

    @IsString()
    @ApiProperty({name:"user_id",example:'507f191e810c19729de860ea'})
    user_id:Types.ObjectId

    @IsString()
    @ApiProperty({name:"music_id",example:'["507f191e810c19729de860ea"]'})
    music_id:Types.ObjectId[]
}