#!/usr/bin/env node

const { spawn, spawnSync, fork } = require('child_process')
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid')
const net = require('net')

function getParam(key) {
    const _key = key;
    const index = process.argv.indexOf(_key)
    if (index == -1) {
        return null;
    }
    return process.argv[index + 1]
}
function isUrl(value) {
    return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(value);
}
function isPort(value) {
    if (value == void 0) return false;
    return !isNaN(Number(value))
}
const server = {};
const config = JSON.parse(readFile('./config.json'))
const package = JSON.parse(readFile('../package.json'))
const startParam = getParam('start');
const configParam = getParam('--config')
const os = require('os');
const setParam = getParam('--set')
const kill = getParam('kill')
const systemType = os.type();
const serverName = getParam('--name')

start();
function start(params) {
    if (process.argv.indexOf('private_list') != -1) {
        
    } else if (process.argv.indexOf('list') != -1) {
        const serverMap = JSON.parse(readFile('./server.json'));
        console.table(serverMap)
    }else if (setParam) {
        const [key, value] = setParam.split('=');
        if (key != 'url' && key != 'port') {
            console.log('无效的配置项')
        } else {
            config[key] = value;
            if (key == 'url') {
                if (!isUrl(value)) {
                    console.error('错误的url路径')
                    return;
                }
            } else if (key == 'port') {
                if (!isPort(value)) {
                    console.error('无效的端口号')
                    return;
                }
            }
            writeFile('./config.json', JSON.stringify(config))
        }
        
    }  else if (process.argv.indexOf('kill') != -1) {
        if (!kill) {
            return console.log('请输入要杀死的端口号')
        }
        const serverMap = JSON.parse(readFile('./server.json'));
        let key = null;
        for(let _key in serverMap) {
            const element = serverMap[_key];
            if (kill == 'all') {
                killServer(element.pid)
                continue;
            }
            if (element.pid == kill) {
                key = _key;
                break;
            }
        }
        if (key != null) {
            delete serverMap[key];
            writeFile('./server.json', JSON.stringify(serverMap))
        }
        if (kill == 'all') {
            writeFile('./server.json', '{}')
        } else {
            killServer(kill);
        }
        
        
    } else if (process.argv.indexOf('--config') != -1) {
        console.log(JSON.stringify(config, null, 2))
    } else if (process.argv.indexOf('start') != -1) {
        
        let url = config.url;
        let port = config.port || 0;
        if (startParam && !/--(.+?)/.test(startParam)) {
            if (isUrl(startParam)) {
                url = startParam;
            } else {
                console.error("错误的url路径")
                return;
            }
        } 
        if (!url) {
            console.error("请传入监听转发的url或者配置默认监听的url")
            return;
        }
        if (isPort(getParam('--port'))) {
            port = getParam('--port')
        }
        const serverKey = url+'__'+port;
        const serverMap = JSON.parse(readFile('./server.json'));
        if (serverMap[serverKey]) {
            console.log([
                '\r',
                "此服务已启动",
                ` $ name    : ${serverMap[serverKey].name}`,
                ` $ pid     : ${serverMap[serverKey].pid}`,
                ` $ 转发url :${serverMap[serverKey].url}`,
                ` $ 服务端口:${serverMap[serverKey].port}`,
                ` $ web地址 :http://127.0.0.1:${port}/proxy`,
                ` $ 请求路径:http://127.0.0.1:${port}/admin/请求路径`,
                '\r'
            ].join('\r\n'))
            return "服务已启动"
        }
        portIsOccupied(port).then(() => {
            const app = spawn('node',['../dist/app.js', '--url', url, '--port', port], {
                // stdio: 'inherit',
                // shell: true,
                cwd: __dirname,
                detached: true,
                stdio: 'ignore',
            })
            app.on('error', () => {
                console.log('创建进程出现错误')
            })
            app.on('close', () => {
                console.log('创建进程出现错误')
            })
            // 在linux(ubuntu)上测试，获取到的pid会比创建的程序真实pid少1
            // 但是window上是正常的
            // 暂时不清楚是linux发行版导致或者是node版本导致
            const pid = app.pid + (systemType == 'Windows_NT' ? 0 : 1);
            serverMap[serverKey] = {
                name: serverName || nanoid(),
                pid,
                url,
                port
            }
            writeFile('./server.json', JSON.stringify(serverMap))
            console.log([
                '\r',
                '监听服务已启动',
                ` $ name    : ${serverMap[serverKey].name}`,
                ` $ pid     : ${pid}`,
                ` $ 转发url : ${url}`,
                ` $ 服务端口: ${port}`,
                ` $ web地址 : http://127.0.0.1:${port}/proxy`,
                ` $ 请求路径: http://127.0.0.1:${port}/admin/请求路径`,
                '\r'
            ].join('\r\n'))
    
            app.unref();
            process.exit();
        }).catch(() => {
            console.log('\r\n $ 创建监听服务识别, 端口被占用了')
            process.exit();
        })
        
    } else {
        help();
    }
}

function help() {
    console.log([
        "\r\n使用指令\r\n",
        " --config                                  查看默认配置",
        " --set url=https://www.xxx.com             配置默认监听的url",
        " --set port=1456                           配置默认端口号，如果设置为0，则表示随机端口",
        " start                                     启动监听服务",
        "   start https://www.a.com                     监听https://www.a.com",
        "                                               如果不传入url必须配置默认url",
        "   start --port 1024                           配置服务启动的端口号",
        "   start https://www.a.com --port 1234         完整实例",
        " kill                                     停止监听",
        "   端口号",
        "   all                                    清空全部服务",
        " list                                     查看启动的服务",
        "\r\n当前版本:"+package.version
        // " list                                   查看已经注册的监听"
    ].join('\r\n'))
}

function readFile (_path) {
    return fs.readFileSync(path.join(__dirname, _path))
}
function writeFile (_path, content) {
    fs.writeFileSync(path.join(__dirname, _path), content)
}
function killServer(pid) {
    if (systemType == 'Windows_NT') {
        spawnSync('taskkill', ['/pid', pid, '-t', '-f'], {
            stdio: 'inherit',
            shell: true,
        })
    } else {
        spawnSync('kill', ['-9', pid]);
    }
}

function portIsOccupied (port) {
    // 创建服务并监听该端口
    var server = net.createServer().listen(port)
    return new Promise((resolve, reject) => {
        server.on('listening', function () { // 执行这块代码说明端口未被占用
            server.close() // 关闭服务
            resolve();
        })
    
        server.on('error', function (err) {
            if (err.code === 'EADDRINUSE') { // 端口已经被使用
                reject();
            }
        })
    })
    

}