import { Injectable } from "@nestjs/common";
import { Music } from "./model/music.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateMusicDto, UpdateMusicDto } from "./dtos";

@Injectable()
export class MusicService {
    constructor(@InjectModel(Music.name) private readonly model: Model<Music>) { }

    async getAllMusics() {
        return await this.model.find().exec()
    }

    async getOneByIdMusic(id: number) {
        return await this.model.findById(id).exec()
    }

    async createMusic(data:CreateMusicDto) {
        const createdMusic = new this.model(data);
        return await createdMusic.save();
    }

    async updateMusic(id:number, data:UpdateMusicDto) {
        const updatedMusic= await this.model.findByIdAndUpdate(id,data)
        return updatedMusic
    }

    async deleteMusic(id:number) {
        return await this.model.findByIdAndDelete(id)
    }
}