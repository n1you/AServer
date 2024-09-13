import { readFileSync } from "node:fs";
import AServer from "./AServer";
import path from "node:path";

const server = new AServer();

server
    .use(async (ctx, next) => {
        if (ctx.req.url === "/") ctx.a = ctx.req.url;

        await next();
    })
    .use(async function (ctx, next) {
        console.log("use 2");

        await next();
    });

server.use(async function (ctx, next) {
    await next();

    const fileData = await readFileSync(
        path.join(__dirname, "../large_json.json")
    ).toString();

    ctx.data = JSON.parse(fileData);
});
console.log('???');

server.listen(9090, () => {
    console.log("http://localhost:9090");
});
