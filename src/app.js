// Load dotenv module
require('dotenv').load()

// Load modules
let path = require('path')
let fs = require('fs')

// App setup
const port = process.env.PORT

let app = require('http').createServer(response)

let io = require('socket.io')(app)

app.listen(port)

console.log('App running on port ' + port)
console.log('Running in: ' + process.env.NODE_ENV)

function response (req, res) {
    let file = ''

    if (req.url === '/') {
        file = path.join(__dirname, '/index.html')
    } else {
        file = path.join(__dirname, '/', req.url)
    }

    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404)
            return res.end('Page or file not found')
        }

        res.writeHead(200)
        res.end(data)
    })
}

io.on('connection', (socket) => {
    socket.on('send message', ({ message, name }, callback) => {
        if (message && name) {
            let currentDate = getCurrentDate()

            io.sockets.emit('update messages', { message, name, currentDate })

            callback()
        }
    })
})

function getCurrentDate () {
    let date = new Date()

    let hour = date.getHours()
    let min = date.getMinutes()
    let sec = date.getSeconds()

    hour = (hour < 10 ? '0' : '') + hour
    min = (min < 10 ? '0' : '') + min
    sec = (sec < 10 ? '0' : '') + sec

    return hour + ':' + min + ':' + sec
}
