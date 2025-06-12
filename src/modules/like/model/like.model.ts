import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({timestamps:true,versionKey:false})
export class Like {

    @Prop({type:mongoose.SchemaTypes.ObjectId,required:true,ref:'Music'})
    music_id:mongoose.Schema.Types.ObjectId;

    @Prop({type:mongoose.SchemaTypes.ObjectId,required:true,ref:'User'})
    user_id:mongoose.Schema.Types.ObjectId;

}
export const LikeSchema = SchemaFactory.createForClass(Like)