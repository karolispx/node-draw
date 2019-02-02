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



let userCount = 0;
let usersConnected = []
let socketUserID = null


// User connecting
io.on('connection', function (socket) {
    // Increase user counter
    socketUserID = socket.handshake.query.userid;

    if ( socketUserID != null ) {
        usersConnected.push(socketUserID)

        io.emit( 'counter', userCount++ );
    }


    // Handler for drawing
    socket.on('draw-on-canvas', function (data) {
        io.emit( 'draw-on-canvas', data );
    })
})

// User disconnecting
io.on('disconnect', function (socket) {
    // Decrease user counter
    if ( socketUserID != null ) {
        let index = usersConnected.indexOf( socketUserID );

        if ( index > -1 ) {
            usersConnected.splice( index, 1 );
            io.emit( 'counter', userCount--);
        }
    }
})