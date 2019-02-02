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

// array of all lines drawn
let pointHistory = [];

io.on('connection', (socket) => {
    for (var i in pointHistory) {
        socket.emit('draw_line', { points: pointHistory[i] } )
    }

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data) {
        // add received line to history
        pointHistory.push(data.points);

        // send line to all clients
        io.emit('draw_line', { points: data.points });
    });

})
