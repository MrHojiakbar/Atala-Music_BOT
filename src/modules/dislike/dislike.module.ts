import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Dislike, DislikeSchema } from "./model";
import { MusicDislikeController } from "./dislike.controller";
import { MusicDislikeService } from "./dislike.service";

@Module({
    imports:[MongooseModule.forFeature([{name:Dislike.name,schema:DislikeSchema}])],
    controllers:[MusicDislikeController],
    providers:[MusicDislikeService],
    exports:[MusicDislikeService]
})
export class DislikeModule {}