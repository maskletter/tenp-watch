
import { HttpStatus, InterceptType, HttpRequest } from "./global";
import ProxyPlugin from './index'

function mergeData(current, newData) {
    for(const header of newData) {
        if (header.type == 'delete') {
            delete current[header.key]
        } else {
            current[header.key] = header.value;
        }
    }
}

function formatData(params, content) {
    return new Function('params', `${content};return Get(params)`)(params)
}
/**
 * 返回值处理
 */
export default () => {
    return {
        name: 'result',
        type: 'value',
        main: ({ interceptor, uid }: ProxyPlugin, status: HttpStatus, request: any, expressRequest: HttpRequest): any => {
            return new Promise((resolve, reject) => {
                const method = expressRequest.method.toLocaleLowerCase();
                const url = '/' + expressRequest.params['0'];
                const common = {
                    query: expressRequest.query,
                    body: expressRequest.fields,
                    mock: interceptor.mock,
                    headers: expressRequest.headers,
                    method: method,
                    url: url,
                    uid,
                    status: 0,
                    time: 0,
                    data: '',
                    size: 0,
                    code: 0
                }
                request.then(v => {
                    const time = +new Date();
                    let data = null;
                    try {
                        data = JSON.parse(v.text);
                    } catch (error) {
                        data = v.text;
                    }

                    let status = 200;
                    if (interceptor.disabled == false) {
                        if (interceptor.returnType == 'text') {
                            try {
                                data = new Function('return ' + interceptor.returnData)();
                            } catch (error) {
                                data = interceptor.returnData    
                            }
                        } else if (interceptor.returnType == 'function') {
                            data = formatData(data, interceptor.returnData)
                        }
                        status = interceptor.status || 200;
                    }
                    common.status = status;
                    common.time = time;
                    common.data = data;
                    common.size = Buffer.byteLength(v.text, 'utf8');
                    resolve(common)
                }).catch(err => {
                    const time = +new Date();
                    common.time = time;
                    common.status = err.status||400;
                    try {
                        common.data = JSON.parse(err.response.text)
                    } catch (error) {
                        common.data = err.response ? err.response.text : err
                    }
                    resolve(common)
                })
            })
            
            
        }
    }
}