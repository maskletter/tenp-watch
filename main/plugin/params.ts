
import { HttpStatus, InterceptType, HttpRequest } from "./global";
import ProxyPlugin from './index'

function mergeData(current, newData) {
    if (!newData) return;
    for(const header of newData) {
        if (header.type == 'delete') {
            delete current[header.key]
        } else {
            current[header.key] = header.value;
        }
    }
}

/**
 * 自定义的headers，query，body处理
 */
export default (params?: {
    start?: Function,
    end?: Function
}) => {
    return {
        name: 'params',
        main: (proxy: ProxyPlugin, status: HttpStatus, request: any, expressRequest: HttpRequest) => {
            const { interceptor } = proxy;
            params.start && params.start(proxy);
            mergeData(expressRequest.headers, interceptor.headers)
            mergeData(expressRequest.query, interceptor.query)
            mergeData(expressRequest.fields, interceptor.fields)
            
            for(let key in expressRequest.headers) {
                if (key == 'host') continue;
                if (key == 'content-length') continue;
                request.set(key, expressRequest.headers[key]);
            }
            request.query(expressRequest.query);
            if (expressRequest.headers['content-length'] != '0') {
                request.send(expressRequest.fields);
            }
            params.end && params.end(proxy);
            return {
                status: HttpStatus.next,
                request: request
            }

        }
    }
}