import * as superagent from 'superagent'
import { HttpStatus, HttpRequest, InterceptType } from "./global";
import System from '../System'
import ProxyPlugin from './index'


export default () => {
    return {
        name: 'request',
        main: ({ interceptor }: ProxyPlugin, status: HttpStatus, request: any, expressRequest: HttpRequest) => {
            if (status == HttpStatus.mock) {
                return {
                    status: HttpStatus.mock,
                    request: request
                }
            } else {
                const method = expressRequest.method.toLocaleLowerCase();
                return {
                    status: HttpStatus.http,
                    request: superagent[method](System.baseUrl + '/' + expressRequest.params['0'])
                }
            }
        }
    }
}