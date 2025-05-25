import { Scenes } from 'telegraf';
import { Update, Message } from 'telegraf/typings/core/types/typegram';

export interface MyContext extends Scenes.SceneContext {
  message: Update.New & Update.NonChannel & Message.AudioMessage;
}
