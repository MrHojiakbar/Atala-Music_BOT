import { MyContext } from 'src/types';
import { MiddlewareFn } from 'telegraf';

export const authMiddleware: MiddlewareFn<MyContext & {session:{isLoggedIn:boolean},message:{text}}> = async (ctx, next) => {
    if (ctx.session?.isLoggedIn) {
        return next();
    }

    const messageText = ctx.message?.text || '';
    if (messageText.startsWith('/myplaylist') || messageText.startsWith('/addtoplaylist')) {
        await ctx.reply('Please log in or register first using /login or /register! 📝');
        return;
    }

    return next();
};
