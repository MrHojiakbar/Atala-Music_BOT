import { Injectable, OnModuleInit } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./model";
import { CreateUserDto, UpdateUserDto } from "./dtos";
export let YOUTUBEuserID:string=''
@Injectable()
export class UserService implements OnModuleInit{
    constructor (@InjectModel(User.name) private readonly model:Model<User>) {}
    async onModuleInit() {
        
        const {data:checkYouTube}=await this.getByUserNameNoPopulate('YouTube')
        if (checkYouTube) {
            YOUTUBEuserID=(checkYouTube._id).toString()
            console.log('YouTube user already exsits')
        }else{
            const {data:createuser}=await this.create({username:'YouTube',playlist_id:'',phone_number:'12345678'})
            YOUTUBEuserID=(createuser._id).toString()
            console.log('YouTube user created')
        }
    }

    async getAll(){
        const users=await this.model.find()
        return {
            message:"success",
            count:users.length,
            data:users,
        }
    }

    async getById(id:string) {
        const user=await this.model.findById(id).populate('playlist_id')
        return {
            message:"success",
            data:user
        }
    }
    async getByUserName(username:string) {
        const foundedUser=await this.model.findOne({username}).populate('playlist_id')
        return {
            message:"success",
            data:foundedUser
        }
    }
    async getByUserNameNoPopulate(username:string) {
        const foundedUser=await this.model.findOne({username})
        return {
            message:"success",
            data:foundedUser
        }
    }
    async create(data:CreateUserDto) {
        const newUser= new this.model(data)
        return {
            message:"success",
            data:await newUser.save()
        };
    }

    async update(id:string,data:UpdateUserDto) {
        console.log(data);
        
        const updatedUser=await this.model.findByIdAndUpdate(id,data,{
            new:true,
            runValidators:true
        })
        return{
            message:"success",
            data:updatedUser
        }
    }
    async delete(id:string) {
        const deletedUser=await this.model.findByIdAndDelete(id)
        return{
            message:"success",
            data:deletedUser
        }
    }
}