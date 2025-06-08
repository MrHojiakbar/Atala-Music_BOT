import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PLaylist, PlaylistSchema } from "./model";
import { PlaylistController } from "./playlist.controller";
import { PLaylistService } from "./playlist.service";

@Module({
    imports:[
        MongooseModule.forFeature([{name:PLaylist.name,schema:PlaylistSchema}])
    ],
    controllers:[PlaylistController],
    providers:[PLaylistService],
    exports:[PLaylistService]
})
export class PlaylistModule {}