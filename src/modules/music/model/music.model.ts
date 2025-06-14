import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { MusicGenres } from "../enums";

@Schema({timestamps:true,versionKey:false})
export class Music {
    @Prop({ type: mongoose.SchemaTypes.String, required: true })
    name: string;

    @Prop({ type: mongoose.SchemaTypes.String, required: true })
    url: string;

    @Prop({ type: mongoose.SchemaTypes.String })
    author: string;

    @Prop({
        type: String,
        enum: Object.values(MusicGenres),
        default:null
    })
    genre: MusicGenres;

    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true })
    uploaded_by: mongoose.Schema.Types.ObjectId;
}

export const MusicSchema = SchemaFactory.createForClass(Music);
