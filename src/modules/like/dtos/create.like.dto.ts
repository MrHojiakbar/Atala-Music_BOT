import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class CreateMusicLikeDto{
    @IsString()
    @ApiProperty({name:"music_id",example:'507f191e810c19729de860ea'})
    music_id:string

    @IsString()
    @ApiProperty({name:"music_id",example:'507f191e810c19729de860ea'})
    user_id:string
}