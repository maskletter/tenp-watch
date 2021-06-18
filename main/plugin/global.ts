import { Request } from "express";
import ProxyPlugin from './index'

enum HttpStatus {
    mock,
    end,
    next,
    http,
    none
}

declare interface InterceptType {
    "headers": any
    "query": any
    "body": any
    "status": number,
    "timeout": number,
    "returnType": string
    "returnData": string,
    "url": string,
    "method": any,
    "mock": boolean,
    "disabled":boolean
    fields: any
}

interface HttpRequest extends Request{
    fields: {
        [prop: string]: any
    }
}
interface PluginType {
    name: string
    type?: string
    main:(proxy: ProxyPlugin, status: HttpStatus, request: any, expressRequest: any) => any
}

export { HttpStatus, InterceptType, HttpRequest, PluginType }