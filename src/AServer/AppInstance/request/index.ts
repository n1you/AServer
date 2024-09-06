import { request as HR, IncomingMessage, RequestOptions } from "http";
import { Interface } from "readline";

type UT = string | URL;

interface NR<P> extends RequestOptions {
    data?: P;
}

export function request<P extends Record<string, any>, R>(
    url: UT,
    _config: NR<P>
) {
    return new Promise<{
        data: R | Buffer[];
        status: IncomingMessage["statusCode"];
        msg: IncomingMessage["statusMessage"];
        _originalResponse: IncomingMessage;
    }>((resolve, reject) => {
        let _U = url as URL;
        if (typeof url === "string") {
            _U = new URL(url);
        }

        const { data: _data, ...configs } = _config;
        let data = _data;
        if (configs.method?.toLowerCase() === "get" && _data) {
            data = undefined;
            Object.entries(_data).forEach(([k, v]) => {
                _U.searchParams.append(k, v);
            });
        }
        const config: RequestOptions = {
            method: "get",
            ...configs,
        };
        const req = HR(_U, config, (res) => {
            let data: string | Buffer[];
            res.on("data", (chunk: Buffer) => {
                try {
                    if (data) data += chunk.toString();
                    else data = chunk.toString();
                } catch (error) {
                    if (typeof data !== "string" && data) {
                        data.push(chunk);
                    } else {
                        data = [chunk];
                    }
                }
            });

            res.on("error", (error) => {
                reject(error);
            });

            res.on("end", () => {
                let _data: R | Buffer[];
                try {
                    // @ts-ignore
                    _data = JSON.parse(data);
                } catch (error) {
                    // @ts-ignore
                    _data = data;
                }
                resolve({
                    _originalResponse: res,
                    data: _data,
                    status: res.statusCode,
                    msg: res.statusMessage,
                });
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        data && req.write(data);

        req.end();
    });
}

type SpecifyingRequestOptions<T> = Omit<NR<T>, "method" | "data">;

request.get = function <T extends Record<string, any>, R = any>(
    url: UT,
    data?: T,
    config?: SpecifyingRequestOptions<T>
) {
    return this<T, R>(url, {
        data,
        ...config,
    });
};

request.post = function <T extends Record<string, any>, R = any>(
    url: UT,
    data?: T,
    config?: SpecifyingRequestOptions<T>
) {
    return this<T, R>(url, {
        data,
        method: "post",
        ...config,
    });
};

request.put = function <T extends Record<string, any>, R = any>(
    url: UT,
    data?: T,
    config?: SpecifyingRequestOptions<T>
) {
    return this<T, R>(url, {
        data,
        method: "put",
        ...config,
    });
};

request.delete = function <T extends Record<string, any>, R = any>(
    url: UT,
    data?: T,
    config?: SpecifyingRequestOptions<T>
) {
    return this<T, R>(url, {
        data,
        method: "delete",
        ...config,
    });
};
