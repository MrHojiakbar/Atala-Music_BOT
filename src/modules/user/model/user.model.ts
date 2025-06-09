import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({timestamps:true,versionKey:false})
export class User {
    @Prop({type:mongoose.SchemaTypes.String,required:true})
    username:string;

    @Prop({type:mongoose.SchemaTypes.String,required:true})
    phone_number:string;

    @Prop({type:mongoose.SchemaTypes.Array,ref:"PLaylist"})
    playlist_id:string[];

}

export const UserSchema = SchemaFactory.createForClass(User);