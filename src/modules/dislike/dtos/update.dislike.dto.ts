import { PartialType } from "@nestjs/swagger"
import { CreateMusicDislikeDto } from "./create.dislike.dto";

export class UpdateMusicDislikeDto extends PartialType(CreateMusicDislikeDto) {}