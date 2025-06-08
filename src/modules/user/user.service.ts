import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./model";
import { CreateUserDto, UpdateUserDto } from "./dtos";

@Injectable()
export class UserService{
    constructor (@InjectModel(User.name) private readonly model:Model<User>) {}

    async getAll(){
        const users=await this.model.find()
        return {
            message:"success",
            count:users.length,
            data:users,
        }
    }

    async getById(id:string) {
        const user=await this.model.findById(id)
        return {
            message:"success",
            data:user
        }
    }
    async getByUserName(username:string) {
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
        const updatedUser=this.model.findByIdAndUpdate(id,data,{
            new:true,
            runValidators:true
        })
        return{
            message:"success",
            data:updatedUser
        }
    }
    async delete(id:string) {
        const deletedUser=this.model.findByIdAndDelete(id)
        return{
            message:"success",
            data:deletedUser
        }
    }
}