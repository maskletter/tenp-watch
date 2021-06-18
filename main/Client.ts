
const Client: {[prop: string]: any} = {};

export default {
    set(key, socket) {
        if (Client[key]) {
            Client[key].push(socket)
        } else {
            Client[key] = [socket]
        }
    },
    delete(key, socket) {
        if (Client[key]) {
            Client[key] = Client[key].filter(v => v.id != socket.id)
        }
    },
    emit(key, data) {
        if (Client[key]) {
            Client[key].forEach(v => {
                v.emit('message',{
                    type: 'http',
                    data
                });
            })
        }
    }
}