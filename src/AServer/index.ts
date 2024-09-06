import { createServer } from "node:http";
import Middleware from "./Middleware";

import { generateContext } from "./tools/content";
import AppInstance from "./AppInstance";

export default class AServer extends Middleware {
    private server?: ReturnType<typeof createServer>;

    constructor() {
        super();
        console.log("AServer run ");

        this.server = createServer(async (req, res) => {
            const ctx = {
                ...(await generateContext(req, res)),
                // app 实例
                app: new AppInstance(),
            };

            await this.runMiddleware(this.middleware!, ctx);

            res.statusCode = ctx.statusCode;

            const data = ctx.data ? JSON.stringify(ctx.data) : undefined;

            res.end(data, () => {
                process.env.debug && console.log("send ok");
            });
        });
    }

    listen(port: number, callBack?: () => void) {
        this.server?.listen(port, () => {
            process.env.debug && console.log("serever connen " + port);

            callBack?.();
        });
    }
}
