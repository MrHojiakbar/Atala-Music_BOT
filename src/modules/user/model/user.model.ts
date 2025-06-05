import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema()
export class User {
    @Prop({type:mongoose.SchemaTypes.String,required:true})
    username:string;

    @Prop({type:mongoose.SchemaTypes.String,required:true})
    phone_number:string;

}

export const UserSchema = SchemaFactory.createForClass(User);