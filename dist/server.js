import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { config } from "dotenv";
import axios from "axios";
//loading env variables and setting the app👇🏽
config();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(cors());
const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);
let key = null;
bot.command("start", async (context) => {
    const chatId = context.chat.id;
    key = context.payload;
    if (key) {
        context.reply("Write dowm your currency rate.\nFor example: 1USDT = 100EAD");
    }
    else {
        context.replyWithHTML(`Welcome to the limited-time USDT to Dirhams exchange auction! 🚀`);
    }
});
bot.on(message("text"), (ctx, next) => {
    const chatId = ctx.chat.id;
    if (key) {
        bot.telegram.sendMessage(key, ctx.message.text, {
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                inline_keyboard: [
                    [
                        {
                            callback_data: `I accepted to buy ${chatId}`,
                            text: "Accept",
                        },
                    ],
                ],
            },
        });
        ctx.replyWithHTML("Notified!\nYour currency rate was sent to the costomer.\nPlease, wait while the costomer is proccessing the transaction.");
    }
    next();
});
bot.action([
    /I accepted to buy \d+/,
    /I already sent USDT to \d+/,
    /I already sent Dirhams to \d+/,
    "I comfirm that I receive",
], async (context) => {
    const id = context.chat?.id;
    if (context.match[0].match(/I accepted to buy \d+/)) {
        context.replyWithHTML("Great!\nPlease, wait while we're traiting your transaction");
        const idToReply = context.match[0].split(" ")[context.match[0].split(" ").length - 1];
        try {
            const resUser = await axios.get(`https://p2p-backend-4mva.onrender.com/wallet/${id}`);
            const user = await resUser.data;
            if (user.user.isSeller) {
                await bot.telegram.sendMessage(idToReply, `The costomer accepeted to deal with you.\nPlease send Dirhams to this bank account bellow 👇🏽👇🏽👇🏽\n ${user.user.wallet}`, {
                    reply_markup: {
                        one_time_keyboard: true,
                        remove_keyboard: true,
                        inline_keyboard: [
                            [
                                {
                                    text: "I have already Send",
                                    callback_data: `I already sent Dirhams to ${id}`,
                                },
                            ],
                        ],
                    },
                });
            }
            else {
                await bot.telegram.sendMessage(idToReply, `The costomer accepeted to deal with you.\nPlease send USDT to this wallet bellow 👇🏽👇🏽👇🏽\n ${user.user.wallet}`, {
                    reply_markup: {
                        one_time_keyboard: true,
                        remove_keyboard: true,
                        inline_keyboard: [
                            [
                                {
                                    text: "I have already Send",
                                    callback_data: `I already sent USDT to ${id}`,
                                },
                            ],
                        ],
                    },
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    if (context.match[0].match(/I already sent USDT to \d+/)) {
        const idToReply = context.match[0].split(" ")[context.match[0].split(" ").length - 1];
        context.replyWithHTML("Super!\nyour transaction was completly done.");
        try {
            bot.telegram.sendMessage(idToReply, `The partner already sent USDT to your wallet account\n\nIf you receive a notification from your account, please click on the button bellow 👇🏽👇🏽`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "I comfirm that I receive",
                                callback_data: "I comfirm that I receive",
                            },
                        ],
                    ],
                },
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    if (context.match[0].match(/I already sent Dirhams to \d+/)) {
        const idToReply = context.match[0].split(" ")[context.match[0].split(" ").length - 1];
        context.replyWithHTML("Super!\nyour transaction was completly done.");
        try {
            bot.telegram.sendMessage(idToReply, `The partner already sent Dirhams to your bank account.\n\nIf you receive a notification from your account, please click on the button bellow 👇🏽👇🏽`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "I comfirm that I receive",
                                callback_data: "I comfirm that I receive",
                            },
                        ],
                    ],
                },
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    // if (context.match[0] === "I comfirm that I receive") {
    //   bot.stop({});
    // }
});
bot.launch();
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
//# sourceMappingURL=server.js.map