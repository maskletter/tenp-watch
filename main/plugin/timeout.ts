import * as superagent from 'superagent'
import { HttpStatus, HttpRequest, InterceptType } from "./global";
import ProxyPlugin from './index'

/**
 * 延迟控制
 */
export default () => {
    return {
        name: 'timeout',
        type: 'continue',
        main: ({ interceptor }: ProxyPlugin, status: HttpStatus, request: any, expressRequest: HttpRequest): Promise<void> => {
            return new Promise((resolve) => {
                const time = interceptor.disabled ? 0 : interceptor.timeout;
                setTimeout(() => {
                    resolve();
                }, time || 0);
            })
        }
    }
}