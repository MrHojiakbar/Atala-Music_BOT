import { PartialType } from "@nestjs/swagger";
import { CreatePlaylistDto } from "./createPlaylist.dto";

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {}