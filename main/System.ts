const fs = require('fs');
const path = require('path');
import { nanoid } from 'nanoid'

function delDir(path){
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

export default class System {
    public static baseUrl = '';
    public static rootPath = '';
    public static port = 0;
    public static init(url): System {
        this.baseUrl = url;
        this.rootPath = path.join(process.cwd(), 'user-config', url.replace(/(http|https):\/\//, ''))
        process.env.baseUrl = url;
        this.createDir(path.join(process.cwd(), 'user-config'));
        this.createDir(this.rootPath);
        return System
    }
    public static user = {};
    public static createDir(_path: string) {
        try {
            var stat = fs.statSync(_path);
            if (stat.isDirectory()) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            fs.mkdirSync(_path)
            return true;
        }
    }
    static writeFile(_path: string, filename: string, content, isInit: boolean = false) {
        try {
            var stat = fs.statSync(path.join(_path, filename));
            if (stat.isFile()) {
                !isInit && fs.writeFileSync(path.join(_path, filename), content);
                return false;
            } else {
                fs.writeFileSync(path.join(_path, filename), content);
                return true;
            }
        } catch (error) {
            fs.writeFileSync(path.join(_path, filename), content);
            return true;
        }
    }
    // 创建用户
    static createUser(name: string): System{
        const userPath = path.join(this.rootPath, name);
        var result = this.createDir(userPath)
        this.writeFile(userPath, 'Interceptor.json', '[]', true);
        // this.user[name] = {
        //     interceptor: JSON.parse(fs.readFileSync(path.join(userPath, 'Interceptor.json')))
        // }
        return System
    }
    static deleteUser(name: string): System {
        const userPath = path.join(this.rootPath, name);
        delDir(userPath);
        return System;
    }
    static getUserInterceptor(name: string) {
        try {
            return JSON.parse(fs.readFileSync(path.join(this.rootPath, name, 'Interceptor.json')))
        } catch (error) {
            return {};
        }
    }
    /**检查连接标识是否存在 */
    static checkUser(name: string) {
        const userPath = path.join(this.rootPath, name);
        try {
            var stat = fs.statSync(userPath);
            if (stat.isDirectory()) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
        
    }
    public static updateInterceptor(username: string, type: string, data): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.checkUser(username)) {
                return reject({ code: 0, msg: '不存在此用户' })
            }
            const interceptor = this.getUserInterceptor(username);
            if (type == 'delete') {
                const [key] = this._getInterceptor(interceptor, data.method, data.url);
                interceptor.splice(key, 1);
            } else {
                if (data.uid) {
                    const [key] = this._getInterceptor(interceptor, data.uid);
                    interceptor[key] = data;
                } else {
                    const [key] = this._getInterceptor(interceptor, data.method, data.url);
                    if (key != undefined) {
                        reject({code: 0, msg: '已存在相同类型拦截器'});
                    } else {
                        data.uid = nanoid();
                        interceptor.push(data)
                    }
                    
                }
                
            }
            this.writeFile(path.join(this.rootPath, username), 'Interceptor.json', JSON.stringify(interceptor))
            resolve();
        })
    }
    private static _getInterceptor(interceptor, method?: string, url?: string) {
        for(const key in interceptor) {
            const inter = interceptor[key];
            if (!url) {
                if (inter.uid == method)    {
                    return [key, inter];
                }
            } else {
                if (inter.method == method && inter.url == url) {
                    return [key, inter];
                }
            }
            
        }
        return [];
    }
    public static getInterceptor(username: string, method: string, url: string) {
        const interceptor = this.getUserInterceptor(username)
        const result = this._getInterceptor(interceptor, method, '/'+url)
        if (result.length) {
            return result.pop();
        } else {
            return {};
        }
    }
}