import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./model";
import { Model } from "mongoose";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PlaylistModule } from "../playlist/playlist.module";

@Module({
    imports:[
        MongooseModule.forFeature([{name:User.name,schema:UserSchema}]),
    ],
    controllers:[UserController],
    providers:[UserService],
    exports:[UserService]
})
export class UserModule {}