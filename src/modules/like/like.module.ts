import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Like, LikeSchema } from "./model";
import { MusicLikeService } from "./like.service";
import { MusicLikeController } from "./like.controller";

@Module({
    imports:[MongooseModule.forFeature([{name:Like.name,schema:LikeSchema}])],
    controllers:[MusicLikeController],
    providers:[MusicLikeService],
    exports:[MusicLikeService]
})
export class LikeModule {}