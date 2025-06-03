import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema()
export class MusicModel {
    @Prop({type:mongoose.Schema.Types.String,required:true})
    original_name:string;

    @Prop({type:mongoose.Schema.Types.String,required:true})
    path_name:string;

    @Prop({type:mongoose.Schema.Types.String})
    author: string;

    @Prop({type:mongoose.Schema.Types.String})
    genre:string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    uploaded_by: string;
}