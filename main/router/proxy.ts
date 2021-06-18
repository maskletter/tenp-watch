import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import System from '../System'
import Client from '../Client'
import PorxyPlugin from '../plugin/index'

import MockPlugin from "../plugin/mock";
import HttpPlugin from "../plugin/http";
import ParamsPlugin from "../plugin/params";
import ResultPlugin from "../plugin/result";
import TimeoutPlugin from "../plugin/timeout";
const app = express.Router();
// const { nanoid } = require('nanoid')


app.all('/:name/*', (req: any, res) => {
    const params = ParamsPlugin({
        end: (proxy: PorxyPlugin) => {
            const method = req.method.toLocaleLowerCase();
            const url = '/' + req.params['0'];
            Client.emit(req.params.name, {
                uid: proxy.uid,
                url, 
                method,
                headers: req.headers,
                query: req.query,
                body: req.fields,
            })
        }
    });
    new PorxyPlugin(req).plugin(
        MockPlugin(),
        HttpPlugin(),
        params,
        TimeoutPlugin(),
        ResultPlugin(),
    ).then((result) => {
        const data = result.pop();
        data.requestLoading = false;
        Client.emit(req.params.name, data)
        if (typeof(data.data) == 'object') {
            res.status(data.status).json(data.data)
        } else {
            res.status(data.status).send(data.data)    
        }
        
    }).catch(err => {
        console.log(err)
        res.json({code:0})
    })

    
    
})

export default app;