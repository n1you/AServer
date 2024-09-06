import { type IncomingMessage, type ServerResponse } from "node:http";

export const generateContext = async (
    req: IncomingMessage,
    res: InstanceType<typeof ServerResponse>
) => {
    const { url, method, headers } = req;

    let body = await new Promise<Record<string, any> | undefined>((res) => {
        let isReceiveData = false;
        let body = "";
        let [dataStartTime, dataEndTime] = [0, 0];

        req.on("data", (data: Buffer) => {
            isReceiveData = true;
            // TODO 多种数据类型
            !dataStartTime && (dataStartTime = Date.now());
            body += data.toString();
        });
        req.on("end", () => {
            dataEndTime = Date.now();

            process.env.debug &&
                console.log(
                    `get Data time is ${(dataEndTime - dataStartTime) / 1000} s`
                );

            try {
                if (body) {
                    res(JSON.parse(body));
                    return;
                }
            } catch (error) {}

            res(undefined);
        });
        process.nextTick(() => {
            if (!isReceiveData) {
                res(undefined);
            }
        });
    });

    const params = Array.from(
        new URLSearchParams(url?.split("?")[1]).entries()
    ).reduce((o, c) => {
        const [k, v] = c;
        o[k] = v;
        return o;
    }, {} as Record<string, string>);

    return {
        method,
        headers,
        params,
        statusCode: 200,
        data: undefined,
        body,
        url,
        req,
        res,
    };
};
