import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PLaylist } from "./model";
import { Model } from "mongoose";
import { CreatePlaylistDto, UpdatePlaylistDto } from "./dtos";

@Injectable()
export class PLaylistService{
    constructor (@InjectModel(PLaylist.name) private readonly model:Model<PLaylist>) {}

    async getAll() {
        const playlists=await this.model.find()

        return {
            message:"success",
            count:playlists.length,
            data:playlists
        }
    }

    async getOneById(id:string) {
        const playlist =  await this.model.findById(id)
        return {
            message:"success",
            data:playlist
        }
    }

    async create(data:CreatePlaylistDto) {
        const newPlaylist = new this.model(data)
        return {
            message:"success",
            data:await newPlaylist.save()
        }
    }

    async update (id:string,data:UpdatePlaylistDto) {
        const updatedPlaylist=this.model.findByIdAndUpdate(id,data,{
            new:true,
            runValidators:true
        })
        return {
            message:"success",
            data:updatedPlaylist
        }
    }

    async delete(id:string) {
        const deletedPlaylist=this.model.findByIdAndDelete(id)
        return {
            message:"success",
            data:deletedPlaylist
        }
    }
}