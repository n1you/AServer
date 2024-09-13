import { createServer, IncomingMessage, ServerResponse } from "node:http";
import Middleware from "./Middleware";

import { generateContext } from "./tools/content";
import AppInstance from "./AppInstance";

export default class AServer extends Middleware {
    private server?: ReturnType<typeof createServer>;

    context: AppInstance;

    constructor() {
        super();
        this.context = new AppInstance();
    }

    /**
     * 
     * @returns 处理 http.createServer
     */
    handlingService() {
        return async (
            req: IncomingMessage,
            res: ServerResponse<IncomingMessage> & {
                req: IncomingMessage;
            }
        ) => {
            /**
             *  单次请求信息
             */
            const ctx = {
                ...(await generateContext(req, res)),
                // app 实例
                app: this.context,
            };

            await this.runMiddleware(this.middleware!, ctx);

            res.statusCode = ctx.statusCode;

            const data = ctx.data ? JSON.stringify(ctx.data) : undefined;

            res.end(data, () => {
                process.env.debug && console.log("send ok");
            });
        };
    }

    ready(callBack?: () => void) {
        console.log("AServer createServer ");
        this.server = createServer(this.handlingService());
        callBack?.();
    }

    listen(port: number, callBack?: () => void) {
        if (this.server) {
            this.server.listen(port, () => {
                process.env.debug && console.log("serever connen " + port);

                callBack?.();
            });
        } else {
            throw Error("Please execute app.ready()");
        }
    }
}
