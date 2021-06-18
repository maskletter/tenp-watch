import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import System from '../System'
const app = express.Router();
// 检查链接是否存在
app.get('/check/:name', (req, res) => {
    res.json({
        code: 200,
        data: System.checkUser(req.params.name),
        baseUrl: System.baseUrl,
        port: System.port
    })
})
// 创建链接
app.post('/create/user/:name', (req, res) => {
    if (System.checkUser(req.params.name)) {
        return res.json({ code: 0, msg: '连接已存在' })
    }
    try {
        System.createUser(req.params.name)
        res.json({
            code: 200,
        })
    } catch (error) {
        console.log(error)
        res.json({
            code: 0,
            msg: '请求出错'
        })
    }
})
// 删除链接
app.delete('/user/:name', (req: any, res) => {
    try {
        System.deleteUser(req.params.name)
        res.json({ code: 200 })
    } catch (error) {
        res.status(400).json(error)   
    }
})
// 创建拦截器
app.post('/:name/interceptor', (req: any, res) => {
    req.fields.headers = JSON.parse(req.fields.headers)
    req.fields.query = JSON.parse(req.fields.query)
    req.fields.body = JSON.parse(req.fields.body)
    req.fields.mock = req.fields.mock == 'true' ? true : false
    req.fields.disabled = req.fields.disabled == 'true' ? true : false
    System.updateInterceptor(req.params.name, 'update', req.fields).then(v => {
        res.json({ code: 200, uid: req.fields.uid })
    }).catch(err => {
        res.status(400).json(err)
    })
    
})
// 创建获取拦截器详情
app.get('/:name/interceptor', (req, res) => {
    if (!System.checkUser(req.params.name)) {
        return res.status(400).json({ code: 0, msg: '不存在此连接' })
    }
    res.json({ code: 200, data: System.getUserInterceptor(req.params.name) })
})
// 删除拦截器
app.delete('/:name/interceptor', (req: any, res) => {
    System.updateInterceptor(req.params.name, 'delete', req.fields).then(v => {
        res.json({ code: 200 })
    }).catch(err => {
        res.status(400).json(err)
    })
})
// 获取当前拦截详情
app.get('/user', (req, res) => {
    res.json({ 
        code: 200, 
        data: fs.readdirSync(System.rootPath).filter(v => fs.statSync(path.join(System.rootPath, v)).isDirectory()) })
})

export default app;