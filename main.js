const HyperExpress = require('hyper-express')
const Server = new HyperExpress.Server()
const Router = new HyperExpress.Router()

Server.get('/', (request, response) => {
    response.send('Hello World')
})

Router.ws('/connect', {
    idle_timeout: 60,
    max_payload_length: 32 * 1024
}, (ws) => {
    console.log(ws.ip + ' is now connected using websockets!')
    ws.send('you be connected')

    ws.on('message', (event) => {
        console.log(event)
        ws.send('you gave me message')
    })
    ws.on('close', () => console.log(ws.ip + ' has now disconnected!'))
})

Server.use('/ws', Router)

Server.listen(8080)
.then(() => console.log('Webserver started on port 8080'))
.catch(() => console.log('Failed to start webserver on port 8080'))