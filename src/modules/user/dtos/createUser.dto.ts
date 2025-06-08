import { ApiProperty } from "@nestjs/swagger"
import {IsString} from 'class-validator'

export class CreateUserDto{
    @IsString()
    @ApiProperty({name:"username",example:'@tokyo'})
    username:string 

    @IsString()
    @ApiProperty({name:"phone_number",example:'+998 123 45 67'})
    phone_number:string

    @IsString()
    @ApiProperty({name:"playlist_id",example:'507f191e810c19729de860ea'})
    playlist_id:string
}