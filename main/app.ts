import * as express from 'express'
import superagent from 'superagent'
import * as formidableMiddleware from 'express-formidable'
import * as cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import Client from './Client'
import System from './System'
import SystemRouter from './router/system'
import ProxyRouter from './router/proxy'
const app = express();

function getParam(key) {
    const _key = `--${key}`
    const index = process.argv.indexOf(_key)
    if (index == -1) {
        return null;
    }
    return process.argv[index + 1]
}

const staticProxbPath = '../assets';
// const staticProxbPath = '../assets'
app.use('/proxy', express.static(path.join(process.cwd(), staticProxbPath)))
app.get('/proxy/*', (req, res) => {
    res.sendFile(path.join(process.cwd(), staticProxbPath+'/index.html'))
})
app.use(cors());
app.use(formidableMiddleware({
    maxFileSize: 500 * 1024 * 1024 * 1000 * 10000
}))
app.set('etag', false)
app.get('/', (req, res) => {
    res.send('<h1>Hello, Server</h1>')
})
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: '*'
});

io.on('connection', client => {
    client.on('event', data => {
        console.log('event', data)
    });
    client.on('disconnect', () => {
        Client.delete(client.request._query.key, client);
    });
});
io.sockets.on('connection',function(socket){
    Client.set(socket.request._query.key, socket);
    socket.emit('message',{text:'你上线了'});
});


const baseUrl = getParam('url')
System.init(baseUrl)
System.createUser('admin')
// System.createUser('job')

app.use(SystemRouter);
app.use(ProxyRouter);

try {
    server.listen(getParam('port') ? Number(getParam('port')) : 0)    
    System.port = (server.address() as any).port;
    console.log([
        '监听服务已启动',
        `转发url: ${baseUrl}`,
        `服务端口: ${System.port}`,
        `访问路径: http://127.0.0.1:${System.port}/admin`,
        `web地址 : http://127.0.0.1:${System.port}/proxy`
    ].join('\r\n'))
} catch (error) {
    console.log(error)
}

