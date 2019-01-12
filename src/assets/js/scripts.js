let countMessages = 0
let messageLimit = 50
let maxMessageLength = 200
let savedName

$(document).ready(() => {
    let message = $('#chat-message')

    savedName = localStorage.getItem('name')

    if (savedName) {
        setUserName(savedName)
    } else {
        setUserName(null)
    }

    updateMessageCount(maxMessageLength)

    message.keyup(() => {
        let messageLength = message.val().length

        updateMessageCount(maxMessageLength - messageLength)
    })

    let socket = io.connect()

    $('#chat-form').submit((event) => {
        event.preventDefault()

        let messageInput = $('#chat-message')
        let message = messageInput.val()

        let nameInput = $('#chat-name')
        let name = nameInput.val()

        if (message && name) {
            socket.emit('send message', { message, name }, () => {
                updateMessageCount(maxMessageLength)

                if (!savedName) {
                    setUserName(name)
                }

                messageInput.val('')
                messageInput.focus()
            })
        } else {
            alert('Please enter all information.')
        }
    })

    socket.on('update messages', ({ message, name, currentDate }) => {
        countMessages++

        if (countMessages > 0) {
            $('.no-messages').remove()
        }

        let fullMessage = '<div class="chat-message" data-placement="right" data-toggle="tooltip" title="' + currentDate + '">'
        fullMessage += '<p class="message-top">' + name + ' <span>says:</span></p>'
        fullMessage += '<p class="message-bottom">' + message + '</p>'
        fullMessage += '</div>'

        let newMessage = $(fullMessage)

        $('#chat-message-list').prepend(newMessage)

        $('.chat-message').tooltip()

        if (countMessages >= messageLimit) {
            $('.chat-message').last().remove();
        }
    })

    $(document).on('click', '#chat-form-reset-button', (event) => {
        event.preventDefault()

        setUserName(null)
    })

    function updateMessageCount (charactersRemaining) {
        let countMessageLength = $('#count-message-length')

        let wordCharacter = 'character'

        if (charactersRemaining > 1) {
            wordCharacter = 'characters'
        }

        countMessageLength.html(charactersRemaining + ' ' + wordCharacter + ' remaining')
    }

    function setUserName (name) {
        if (name === null) {
            localStorage.removeItem('name')

            let nameInput = $('#chat-name')

            nameInput.val('')

            $('#chat-name-saved').hide()
            $('#chat-name-saved-value').html('')
            $('#chat-name-new').show()

            nameInput.focus()
        } else {
            $('#chat-name-new').hide()
            $('#chat-name-saved-value').html(name)

            $('#chat-name').val(name)
            $('#chat-name-saved').fadeIn(1000)

            localStorage.setItem('name', name)
        }
    }
})
