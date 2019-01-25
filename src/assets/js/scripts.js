$(document).ready(() => {

    let initialToolColor = getRandomRgb()

    $('#tool-color-selector').val(initialToolColor);


    function getRandomRgb() {
        var num = Math.round(0xffffff * Math.random());
        var r = num >> 16;
        var g = num >> 8 & 255;
        var b = num & 255;
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    $('canvas').awesomeCursor('paint-brush', {
        hotspot: [0, 17],
        size: 20
    });

    setTimeout(function(){
        $('.page-preloader').remove('.page-preloader');
        $(".page-preloader").fadeOut(500);
    }, 1000);

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
    let toolSize = 10
    let color = initialToolColor
    let globalCompositeOperation = 'source-over'
    let lineJoin = 'round'
    let lineCap = 'round'
    let globalAlpha = 1

    let shadowOffsetX = 0
    let shadowOffsetY = 0
    let shadowBlur = 0
    let shadowColor = ''




    $('#canvas-background-color').minicolors({
        format: 'rgb',
        opacity: true,
        changeDelay: 250,
        change: function (rgba) {
            if ( rgba ) {
                $('canvas').css('background', rgba)
            }
        }
    });

    $('#shadowcolor-input-area').minicolors({
        format: 'rgb',
        opacity: true,
        changeDelay: 250,
        change: function (rgba) {
            if ( rgba === '' ) {
                shadowColor = ''
            } else {
                shadowColor = rgba
            }
        }
    });

    $('#tool-color-selector').minicolors({
        format: 'rgb',
        opacity: false,
        changeDelay: 250,
        change: function (rgb) {
            if ( rgb === '' ) {
                rgb = initialToolColor

                $('#tool-color-selector').minicolors('value', rgb);
            }

            color = rgb
        }
    });


    $( "#tool-effect" ).change(function() {
        globalCompositeOperation = $(this).val()
    });

    $( "#linejoin-type" ).change(function() {
        lineJoin = $(this).val()
    });

    $( "#linecap-type" ).change(function() {
        lineCap = $(this).val()
    });


    $("#shadowoffsetx-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    });

    $("#shadowoffsetx-slider-area").on("slide slideStop", function(slideEvt) {
        let slideValue = slideEvt.value

        shadowOffsetX = slideValue
    });


    $("#shadowoffsety-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    });

    $("#shadowoffsety-slider-area").on("slide slideStop", function(slideEvt) {
        let slideValue = slideEvt.value

        shadowOffsetY = slideValue
    });


    $("#shadowblur-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    });

    $("#shadowblur-slider-area").on("slide slideStop", function(slideEvt) {
        let slideValue = slideEvt.value

        shadowBlur = slideValue
    });


    $("#size-slider-area").slider({
        formatter: function(value) {
            return value + 'px'
        }
    });


    $("#size-slider-area").on("slide slideStop", function(slideEvt) {
        let slideValue = slideEvt.value

        toolSize = parseInt(slideValue)
    });


    $("#opacity-slider-area").slider()

    $("#opacity-slider-area").on("slide slideStop", function(slideEvt) {
        let slideValue = slideEvt.value

        globalAlpha = slideValue
    });

    // Mousedown
    $(canvas).on('mousedown', (e) => {
        lastMousex = mousex = e.offsetX * canvas.width / canvas.clientWidth | 0
        lastMousey = mousey = e.offsetY * canvas.height / canvas.clientHeight | 0

        mousedown = true
    })

    // Mouseup
    $(canvas).on('mouseup', (e) => {
        mousedown = false
    })

    // Mousemove
    $(canvas).on('mousemove', (e) => {
        mousex = e.offsetX * canvas.width / canvas.clientWidth | 0
        mousey = e.offsetY * canvas.height / canvas.clientHeight | 0

        if (mousedown) {
            ctx.beginPath()

            if ( shadowColor ) {
                ctx.shadowOffsetX = shadowOffsetX
                ctx.shadowOffsetY = shadowOffsetY
                ctx.shadowBlur    = shadowBlur
                ctx.shadowColor   = shadowColor
            } else {
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 0
                ctx.shadowBlur    = 0
                ctx.shadowColor   = ''
            }

            ctx.lineWidth = toolSize
            ctx.strokeStyle = color

            ctx.globalAlpha = globalAlpha;

            if ( toolType === 'brush' ) {
                ctx.globalCompositeOperation = globalCompositeOperation
            } else {
                ctx.globalCompositeOperation = 'destination-out'
            }

            ctx.moveTo(lastMousex, lastMousey)
            ctx.lineTo(mousex, mousey)

            ctx.lineJoin = lineJoin

            ctx.lineCap = lineCap

            ctx.stroke()
        }

        lastMousex = mousex
        lastMousey = mousey

        // Output
        $('#output').html('current: ' + mousex + ', ' + mousey + '<br/>last: ' + lastMousex + ', ' + lastMousey + '<br/>mousedown: ' + mousedown)
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

            if ( toolSelected === 'brush'  ) {
                $('#tool-color-selector').prop('disabled', false);

                $('canvas').awesomeCursor('paint-brush', {
                    hotspot: [0, 17]
                });
            }

            if ( toolSelected === 'eraser' ) {
                $('#tool-color-selector').prop('disabled', true);

                $('canvas').awesomeCursor('eraser', {
                    hotspot: [0, 17]
                });
            }
        }
    })

    function fitToContainer (canvas) {
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
    }
})
