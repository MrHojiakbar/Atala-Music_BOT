import { PartialType } from "@nestjs/swagger"
import { CreateMusicDto } from "./musicCreate.dto"

export class UpdateMusicDto extends PartialType(CreateMusicDto) {}