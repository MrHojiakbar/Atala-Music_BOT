import { PartialType } from "@nestjs/swagger"
import { CreateMusicLikeDto } from "./create.like.dto";

export class UpdateMusicLikeDto extends PartialType(CreateMusicLikeDto) {}