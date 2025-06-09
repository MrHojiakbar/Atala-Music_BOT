import { Scene, SceneEnter, On, Ctx } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { UserService } from 'src/modules/user/user.service';
import { CreateUserDto } from 'src/modules/user/dtos';
import { MyContext } from 'src/types';

@Scene('register')
export class RegisterScene {
  constructor(private readonly userService: UserService) {}

  @SceneEnter()
  async onEnter(@Ctx() ctx: MyContext) {
    await ctx.reply(
      '📱 Please share your phone number to register:',
      Markup.keyboard([
        Markup.button.contactRequest('📲 Share Contact'),
      ])
        .oneTime()
        .resize()
    );
  }

  @On('contact')
  async onContact(@Ctx() ctx: MyContext & {session:any,message:any}) {
    const contact = ctx.message?.contact;
    const from = ctx.message?.from;

    if (!contact || !from) {
      await ctx.reply('❗ Contact not received. Try again.');
      return;
    }

    const phone_number = contact.phone_number;
    const username = from.username;

    const dto: CreateUserDto = {
      username,
      phone_number,
      playlist_id: null,
    };

    const user:any = await this.userService.create(dto);

    ctx.session.isLoggedIn = true;
    ctx.session.user = {
      _id: user.data._id,
      username: user.data.username,
      phone_number: user.data.phone_number,
    };

    await ctx.reply(`✅ Congratulations, @${username}, you have successfully registered!`);
    await ctx.scene.leave();
  }
}
