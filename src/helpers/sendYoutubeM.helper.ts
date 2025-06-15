import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { lastValueFrom } from 'rxjs';
import { HttpService } from "@nestjs/axios";
import { MyContext } from "src/types";

function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function sendYouTubeResults(
  ctx: MyContext , 
  query: string, 
  httpService: HttpService, 
  pageToken?: string,
  displayPage: number = 1  
) {
  const API_KEY = process.env.API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search`;
  const params: any = {
    part: 'snippet',
    q: 'music ' + query,
    key: API_KEY,
    maxResults: 20,
    type: 'video',
  };
  if (pageToken) {
    params.pageToken = pageToken;
  }

  try {
    const response$ = httpService.get(url, { params });
    const response: any = await lastValueFrom(response$);
    const userId = (ctx as any).session?.user?._id;
    
    if (!userId) {
      await ctx.reply('Register to unlock this command! 😉👇\n/register');
      return;
    }
    
    
    const results = response.data.items;
    if (!results.length) {
      await ctx.reply('❌ No music found for your search.');
      return;
    }

    const chunkedResults = chunkArray(results, 5);

    if (displayPage < 1) displayPage = 1;
    if (displayPage > chunkedResults.length) displayPage = chunkedResults.length;

    const currentResults = chunkedResults[displayPage - 1];

    (ctx.session as any).youTubeResults = results;

    let message = `🔍 *Search results for:* "${query}"\n`;
    message += `📄 Page: ${displayPage} / ${chunkedResults.length}\n\n`;

    const startNumber = (displayPage - 1) * 5 + 1;
    currentResults.forEach((item: any, index: number) => {
      message += `${startNumber + index}. ${item.snippet.title}\n`;
    });

    const buttons = currentResults.map((item: any, index: number) => 
      Markup.button.callback(
        `${startNumber + index}`,
        `select_${item.id.videoId}_${startNumber + index - 1}_${userId}`
      )
    );

    const navigationButtons: InlineKeyboardButton[] = [];

    if (displayPage > 1) {
      navigationButtons.push(
        Markup.button.callback('⬅️ Previous', `navigate_${query}_${pageToken || ''}_${displayPage - 1}`)
      );
    }

    if (displayPage < chunkedResults.length) {
      navigationButtons.push(
        Markup.button.callback('Next ➡️', `navigate_${query}_${pageToken || ''}_${displayPage + 1}`)
      );
    }

    const inlineKeyboard = [buttons];
    if (navigationButtons.length) inlineKeyboard.push((navigationButtons as any));

    await ctx.replyWithMarkdown(message, Markup.inlineKeyboard(inlineKeyboard));

  } catch (error) {
    console.error('Error during YouTube search:', error);
    await ctx.reply('❌ An error occurred while searching YouTube. Please try again later.');
  }
}
