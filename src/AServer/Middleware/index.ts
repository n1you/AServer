import { ServerResponse, type IncomingMessage } from "node:http";
import { generateContext } from "../tools/content";
import AppInstance from "../AppInstance";

interface MiddlewareFNs {
    callBack: (this: CTX, ctx: CTX, next: () => Promise<void>) => Promise<void>;
    next: MiddlewareFNs | null;
}

interface Content extends Awaited<ReturnType<typeof generateContext>> {}
interface Content extends Record<string, any> {}

interface CTX extends Content {
    app: AppInstance & Record<string, any>;
}

export default class Middleware {
    protected middleware?: MiddlewareFNs;

    protected runMiddleware: (
        currentMiddleware: MiddlewareFNs,
        ctx: CTX
    ) => Promise<void> = (currentMiddleware, ctx) => {
        if (currentMiddleware) {
            if (currentMiddleware.next) {
                const runtimeFN = async function () {
                    // @ts-ignore

                    return await this.runMiddleware(
                        currentMiddleware.next!,
                        ctx
                    );
                }.bind(this);
                return currentMiddleware.callBack.call(ctx, ctx, runtimeFN);
            } else {
                return currentMiddleware.callBack.call(
                    ctx,
                    ctx,
                    async () => {}
                );
            }
        } else {
            return Promise.resolve();
        }
    };
    private lastMiddleware?: MiddlewareFNs;

    private generateMiddlewareItem = (callBack: MiddlewareFNs["callBack"]) => {
        return {
            callBack,
            next: null,
        };
    };

    use(callBack: MiddlewareFNs["callBack"]) {
        if (!this.lastMiddleware) {
            this.middleware = this.generateMiddlewareItem(callBack);
            this.lastMiddleware = this.middleware;
        } else {
            this.lastMiddleware.next = this.generateMiddlewareItem(callBack);
            this.lastMiddleware = this.lastMiddleware.next;
        }
        return this;
    }
}
