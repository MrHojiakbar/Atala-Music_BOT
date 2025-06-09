import { MyContext } from "src/types";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

export async function sendPlaylistPage(ctx: MyContext & {session:any}, playlists: any[], page: number) {
    const pageSize = 5;
    const totalPages = Math.ceil(playlists.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPlaylists = playlists.slice(startIndex, endIndex);
    console.log(currentPlaylists);
    
    let message = `🎵 Playlists (Page ${page}/${totalPages}):\n`;
    currentPlaylists.forEach((pl, i) => {
        message += `${startIndex + i + 1}. ${pl.name}\n`;
    });

    const buttons: InlineKeyboardButton[][] = [[],[]];

    if (page > 1) {
        buttons[1].push({ text: '⬅️ Previous', callback_data: `playlist_page_${page - 1}` });
    }

    currentPlaylists.forEach((pl, i) => {
        buttons[0].push({ text: `${i + 1}`, callback_data: `playlist_id_${String(pl._id)}` });
    });

    if (page < totalPages) {
        buttons[1].push({ text: 'Next ➡️', callback_data: `playlist_page_${page + 1}` });
    }

    await ctx.reply(message, {
        reply_markup: {
            inline_keyboard: buttons
        }
    });

}
