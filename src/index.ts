import { readFileSync } from "node:fs";
import AServer from "./AServer";
import path from "node:path";
import { request } from "node:http";

const server = new AServer();

server.use(async (ctx, next) => {
    if (ctx.req.url === "/") ctx.a = ctx.req.url;

    await next();
});

server.use(async function (ctx, next) {
    await next();

    const fileData = await readFileSync(
        path.join(__dirname, "../large_json.json")
    ).toString();

    ctx.data = JSON.parse(fileData);
});

server.listen(9090, () => {
    console.log("http://localhost:9090");
});
