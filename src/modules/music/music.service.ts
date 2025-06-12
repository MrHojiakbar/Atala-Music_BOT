import { Injectable } from "@nestjs/common";
import { Music } from "./model/music.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateMusicDto, UpdateMusicDto } from "./dtos";
import { MusicGenres } from "./enums";

@Injectable()
export class MusicService {
    constructor(@InjectModel(Music.name) private readonly model: Model<Music>) { }


    async getAllMusics() {
        const musics=await this.model.find().exec()
        return {
            message:"success",
            count:musics.length,
            data:musics
        }
    }

    async getOneByIdMusic(id: string) {
        const music=await this.model.findById(id).exec()
        return {
            message:"success",
            data:music
        }
    }
    async getByName(name:string) {
        console.log(name);
        
        const musics=await this.model.find({
        name: { $regex: new RegExp(`^${name}`, 'i') }
    })
        console.log(musics);
        
        return {
            message:'success',
            data:musics
        }
    }
    async getByGenre(genre:MusicGenres) {
        const musics=await this.model.find({genre}).exec()
        return {
            message:"success",
            count:musics.length,
            data:musics
        }
    }

    async createMusic(data:CreateMusicDto) {
        const createdMusic = new this.model(data);
        return {
            message:"success",
            data:await createdMusic.save()
        };
    }

    async updateMusic(id:string, data:UpdateMusicDto) {
        const updatedMusic= await this.model.findByIdAndUpdate(id,data,{
            new:true,
            runValidators:true
        })
        return {
            message:"success",
            data:updatedMusic
        }
    }

    async deleteMusic(id:string) {
        const deletedMusic=await this.model.findByIdAndDelete(id)
        return {
            message:"success",
            data:deletedMusic
        }
    }
}