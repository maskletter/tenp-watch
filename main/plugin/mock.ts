
import { HttpStatus, InterceptType } from "./global";
import ProxyPlugin from './index'

function formatData(params, content) {
    return new Function('params', `${content};return Get(params)`)(params)
}

class MockRequest {

    constructor(public url: string) {
        this.url = url
    }

    $body = {};
    $query = {};
    $headers = {};
    text = '';
    set(key, value) {
        this.$headers[key] = value;
        return this;
    }
    query(value) {
        this.$query = value;
        return this;
    }
    send(value) {
        this.$body = value;
        return this;
    }
    setContent(text) {
        this.text =text;
    }
    then(cb) {
        cb && cb({
            text: this.text
        });
        return this
    }
    catch(cb) {
        // cb && cb();
        // console.log('$ mock环境catch已被隐藏 ')
        return this
    }

}

export default () => {
    return {
        name: 'mock',
        main: ({ interceptor }: ProxyPlugin, status: HttpStatus, request: any) => {
            if (
                !interceptor ||
                !interceptor.mock
            ) {
                return {
                    status: HttpStatus.next,
                    request: null
                }
            }
            return {
                status: HttpStatus.mock,
                request: new MockRequest(interceptor.url)
            }
        }
    }
}