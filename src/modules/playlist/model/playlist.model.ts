import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({timestamps:true,versionKey:false})
export class PLaylist {

    @Prop({type:mongoose.SchemaTypes.String,required:true})
    name:string;

    @Prop({type:mongoose.SchemaTypes.String,ref:'User'})
    user_id:string;

    @Prop({type:mongoose.SchemaTypes.Array,ref:'Music'})
    music_id:string[];
}
export const PlaylistSchema=SchemaFactory.createForClass(PLaylist)