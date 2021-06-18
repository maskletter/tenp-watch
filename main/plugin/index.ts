
import System from '../System'
import { HttpStatus, InterceptType, HttpRequest, PluginType } from "./global";
import { nanoid } from 'nanoid'

class ProxyPlugin {

    /**
     * 请求的url
     */
    public url: string = '';
    /**
     * 耗时
     */
    public startTime: number = +new Date();
    /**
     * 拦截器参数
     */
    public interceptor: InterceptType;
    public uid = nanoid();
    private request: HttpRequest;

    constructor(private req: HttpRequest) {
        this.init();
    }

    private init() {
        const req: HttpRequest = this.request = this.req;
        const method = req.method.toLocaleLowerCase();
        this.interceptor = System.getInterceptor(req.params.name, method, req.params['0']);
    }

    public plugin(...argv: PluginType[]): Promise<any[]> {
        let index = 0;
        let current = { status: HttpStatus.none, request: null };
        let result = [];
        return new Promise(async (resolve, reject) => {
            try {
                while (argv[index]) {
                    var _result = await argv[index].main(this, current.status, current.request, this.request)
                    if (argv[index].type != 'continue') {
                        result.push(_result)
                        current.status = _result.status;
                        current.request = _result.request;
                    }
                    if (argv[index].name == 'result') {
                        _result.time = _result.time - this.startTime
                    }
                    index++;
                }
                resolve(result)
            } catch (error) {
                reject(error)
            }
        })
        
    }

}

export default ProxyPlugin;