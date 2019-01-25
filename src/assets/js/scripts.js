$(document).ready(() => {
    setTimeout(function(){
        $('.page-preloader').remove('.page-preloader')
        $(".page-preloader").fadeOut(500)
    }, 1000)


    $('canvas').awesomeCursor('paint-brush', {
        hotspot: [0, 17],
        size: 20
    })
    
    
    let initialDrawColor = getRandomRgba()

    $('#tool-color-selector').val(initialDrawColor)
    

    // Canvas
    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d')

    fitToContainer(canvas)


    // Variables
    let lastMousex = 0
    let lastMousey = 0

    let mousex = 0
    let mousey = 0

    let mousedown = false

    let toolType = 'brush'

    let drawOptions = {
        'size': 20,
        'color': initialDrawColor,
        'effect': 'source-over',
        'lineJoin': 'round',
        'lineCap': 'round',
        'shadowX': 0,
        'shadowY': 0,
        'shadowBlur': 0,
        'shadowColor': 0
    }

    let eraserOptions = {
        'size': 20,
    }

    let drawOptionsInitial = jQuery.extend({}, drawOptions)


    $('#canvas-background-color').minicolors({
        control: 'wheel',
        position: 'top left',
        format: 'rgb',
        opacity: true,
        changeDelay: 250,
        change: function (colorValue) {
            if ( colorValue ) {
                $('canvas').css('background', colorValue)
            }
        }
    })


    // Settings for 'eraser' tool
    $("#erasersize-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    })

    $("#erasersize-slider-area").on("slide slideStop", function(slideEvt) {
        eraserOptions.size = parseInt(slideEvt.value)
    })



    // Settings for 'draw' tool
    $('#shadowcolor-input-area').minicolors({
        control: 'wheel',
        format: 'rgb',
        opacity: true,
        changeDelay: 250,
        change: function (colorValue) {
            if ( colorValue === '' ) {
                drawOptions.shadowColor = ''
            } else {
                drawOptions.shadowColor = colorValue
            }
        }
    })

    $('#tool-color-selector').minicolors({
        control: 'wheel',
        format: 'rgb',
        opacity: true,
        change: function (colorValue) {
            if ( colorValue === '' ) {
                drawOptions.color = initialDrawColor

                $('#tool-color-selector').minicolors('value', newColor)
            } else {
                drawOptions.color = colorValue
            }
        }
    })


    $( "#tool-effect" ).change(function() {
        drawOptions.effect = $(this).val()
    })

    $( "#linejoin-type" ).change(function() {
        drawOptions.lineJoin = $(this).val()
    })

    $( "#linecap-type" ).change(function() {
        drawOptions.lineCap = $(this).val()
    })


    $("#shadowoffsetx-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    })

    $("#shadowoffsetx-slider-area").on("slide slideStop", function(slideEvt) {
        drawOptions.shadowX = slideEvt.value
    })


    $("#shadowoffsety-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    })

    $("#shadowoffsety-slider-area").on("slide slideStop", function(slideEvt) {
        drawOptions.shadowY = slideEvt.value
    })


    $("#shadowblur-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    })

    $("#shadowblur-slider-area").on("slide slideStop", function(slideEvt) {
        drawOptions.shadowBlur = slideEvt.value
    })


    $("#size-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    })

    $("#size-slider-area").on("slide slideStop", function(slideEvt) {
        drawOptions.size = parseInt(slideEvt.value)
    })

    // Mousedown
    $(canvas).on('mousedown', (e) => {
        lastMousex = mousex = e.offsetX * canvas.width / canvas.clientWidth | 0
        lastMousey = mousey = e.offsetY * canvas.height / canvas.clientHeight | 0

        mousedown = true
    })


    // Mouseup / mouseout
    $(canvas).on('mouseup mouseout', (e) => {
        mousedown = false
    })


    // Mousemove
    $(canvas).on('mousemove', (e) => {
        mousex = e.offsetX * canvas.width / canvas.clientWidth | 0
        mousey = e.offsetY * canvas.height / canvas.clientHeight | 0

        if ( mousedown && ( toolType === 'brush' || toolType === 'eraser' ) ) {
            ctx.beginPath()

            if ( toolType === 'brush' ) {
                ctx.strokeStyle = drawOptions.color
                ctx.lineWidth = drawOptions.size

                ctx.lineJoin = drawOptions.lineJoin
                ctx.lineCap = drawOptions.lineCap
                ctx.globalCompositeOperation = drawOptions.effect

                if ( $("#disable-tool-shadow").is(':checked') !== true && drawOptions.shadowColor) {
                    ctx.shadowOffsetX = drawOptions.shadowX
                    ctx.shadowOffsetY = drawOptions.shadowY
                    ctx.shadowBlur    = drawOptions.shadowBlur
                    ctx.shadowColor   = drawOptions.shadowColor
                } else {
                    ctx.shadowOffsetX = drawOptionsInitial.shadowX
                    ctx.shadowOffsetY = drawOptionsInitial.shadowY
                    ctx.shadowBlur    = drawOptionsInitial.shadowBlur
                    ctx.shadowColor   = drawOptionsInitial.shadowColor
                }

                if ( $("#disable-tool-effects").is(':checked') === true ) {
                    ctx.lineJoin = drawOptionsInitial.lineJoin
                    ctx.lineCap = drawOptionsInitial.lineCap
                    ctx.globalCompositeOperation = drawOptionsInitial.effect
                }
            } else {
                ctx.shadowOffsetX = drawOptionsInitial.shadowX
                ctx.shadowOffsetY = drawOptionsInitial.shadowY
                ctx.shadowBlur    = drawOptionsInitial.shadowBlur
                ctx.shadowColor   = drawOptionsInitial.shadowColor

                ctx.lineJoin = drawOptionsInitial.lineJoin
                ctx.lineCap = drawOptionsInitial.lineCap

                ctx.strokeStyle = drawOptionsInitial.color
                ctx.lineWidth = eraserOptions.size

                ctx.globalCompositeOperation = 'destination-out'
            }

            ctx.moveTo(lastMousex, lastMousey)
            ctx.lineTo(mousex, mousey)

            ctx.stroke()
        }

        lastMousex = mousex
        lastMousey = mousey

        // Output
        // $('#output').html('current: ' + mousex + ', ' + mousey + '<br/>last: ' + lastMousex + ', ' + lastMousey + '<br/>mousedown: ' + mousedown)
    })


    $(document).on('click', '#clear-canvas', (event) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    })


    $(document).on('click', '.tool-selector', (event) => {
        let toolSelected = $(event.target).data('tool')

        if ( toolSelected === 'brush' || toolSelected === 'eraser' ) {
            $('.tool-selector').removeClass('btn-primary')
            $('.tool-selector').addClass('btn-secondary')

            $(event.target).removeClass('btn-secondary')
            $(event.target).addClass('btn-primary')

            toolType = toolSelected

            if ( toolSelected === 'brush' ) {
                $('.canvas-controls-group-eraser').hide()
                $('.canvas-controls-group-draw').show()

                $('canvas').awesomeCursor('paint-brush', {
                    hotspot: [0, 17]
                })
            }

            if ( toolSelected === 'eraser' ) {
                $('.canvas-controls-group-eraser').show()
                $('.canvas-controls-group-draw').hide()

                $('canvas').awesomeCursor('eraser', {
                    hotspot: [0, 17]
                })
            }
        }
    })

    function getRandomRgba() {
        var num = Math.round(0xffffff * Math.random())
        var r = num >> 16
        var g = num >> 8 & 255
        var b = num & 255
        return 'rgba(' + r + ', ' + g + ', ' + b + ', 1)'
    }


    function fitToContainer (canvas) {
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
    }
})
