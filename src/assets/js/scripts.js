$(document).ready(() => {
    $('[data-toggle="tooltip"]').not( ":even" ).tooltip();

    // Page preloader
    setTimeout(function() {
        $('.page-preloader').remove('.page-preloader')
        $('.page-preloader').fadeOut(500)
    }, 1000)


    // Set up Canvas
    let canvas = document.querySelector('#paint')
    let canvasContext = canvas.getContext('2d')

    let sketch = document.querySelector('#sketch')
    let sketchStyle = getComputedStyle(sketch)

    canvas.width = parseInt(sketchStyle.getPropertyValue('width'))
    canvas.height = parseInt(sketchStyle.getPropertyValue('height'))


    // Creating a temporary canvas
    let temporaryCanvas = document.createElement('canvas')
    let temporaryCanvasContext = temporaryCanvas.getContext('2d')

    temporaryCanvas.id = 'temporary-canvas'
    temporaryCanvas.width = canvas.width
    temporaryCanvas.height = canvas.height

    sketch.appendChild(temporaryCanvas)


    $(temporaryCanvas).contextmenu(function(e) {
        e.preventDefault();
        e.stopPropagation();
    });


    // Variables
    let mouse = {x: 0, y: 0}

    let lastPageX = 0
    let lastPageY = 0

    let graphPoints = []


    let swatchColors = [
        '#ffffff', '#000000', '#ef9a9a', '#90caf9', '#a5d6a7', '#fff59d', '#ffcc80',
        '#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800', '#795548', '#9e9e9e'
    ]

    let swatchColorsUse = swatchColors.slice( 0, 12 );

    let modalColorPickerItemsCounter = 0
    let modalColorPickerItems = []

    $( '.modal-color-picker-item' ).each(function( i ) {
        let squareItem = $( this )

        let itemClass = 'modal-color-picker-item-' + i

        modalColorPickerItems.push(itemClass)

        squareItem.addClass(itemClass)

        let squareColor = getRandomRGB()

        if ( swatchColorsUse.length > 0 ) {
            squareColor = swatchColorsUse.pop()
        }

        squareItem.css( 'background', squareColor )
        squareItem.html( '<span>' + squareColor + '</span>'  )
    });


    let initialBrushColor = getRandomRGB()
    let toolType = 'brush'

    let brushOptions = {
        'size': 25,
        'opacity': 1,
        'color': initialBrushColor,
        'lineCap': 'round',
        'shadowX': 0,
        'shadowY': 0,
        'shadowBlur': 0,
        'shadowColor': 0
    }

    let eraserOptions = {
        'size': 25,
        'color': 'white'
    }

    let brushOptionsInitial = jQuery.extend({}, brushOptions)

    let canvasCursorColor = 'rgb(0, 0, 0)'

    let allowToolControls = true

    updateCanvasCursor()
    updateCanvasMouse()

    // Canvas background color
    $('#canvas-background-color-picker').minicolors({
        control: 'wheel',
        position: 'botton right',
        format: 'rgb',
        opacity: true,
        changeDelay: 250,
        change: function (colorValue) {
            if ( colorValue ) {
                $(canvas).css('background', colorValue)
            }
        }
    })

    // Canvas cursor color
    $('#canvas-cursor-color-picker').minicolors({
        control: 'wheel',
        position: 'botton right',
        format: 'rgb',
        changeDelay: false,
        change: function (colorValue) {
            if ( colorValue ) {
                canvasCursorColor = colorValue
                updateCanvasCursor()
            }
        }
    })


    // Eraser size
    let eraserSizeSlider = $("#eraser-size-slider")

    eraserSizeSlider.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    eraserSizeSlider.on("slide slideStop", function(slideEvt) {
        eraserOptions.size = parseInt(slideEvt.value)

        updateCanvasMouse()
    })


    // Modal Brush color
    let modalBrushColorPicker = $("#modal-brush-color-picker")

    modalBrushColorPicker.minicolors({
        format: 'rgb',
        opacity: false,
        swatches: swatchColors,
        change: function (colorValue) {
            if ( colorValue === '' ) {
                brushOptions.color = initialBrushColor
            } else {
                brushOptions.color = colorValue
            }

            updateCanvasMouse('color')
        }
    })


    // Brush color
    let brushColorPicker = $("#brush-color-picker")

    brushColorPicker.val( initialBrushColor )

    brushColorPicker.minicolors({
        format: 'rgb',
        opacity: false,
        swatches: swatchColors,
        change: function (colorValue) {
            if ( colorValue === '' ) {
                brushOptions.color = initialBrushColor
            } else {
                brushOptions.color = colorValue
            }

            updateCanvasMouse('color')
        }
    })


    // Brush size
    let brushSizeSlider = $("#brush-size-slider")

    brushSizeSlider.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushSizeSlider.on("slide slideStop", function(slideEvt) {
        brushOptions.size = parseInt(slideEvt.value)

        updateCanvasMouse()
    })


    // Brush opacity
    let brushOpacitySlider = $("#brush-opacity-slider")

    brushOpacitySlider.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value
        }
    })

    brushOpacitySlider.on("slide slideStop", function(slideEvt) {
        brushOptions.opacity = slideEvt.value
    })


    // Brush line cap
    $( "#brush-line-cap-dropdown" ).change(function() {
        brushOptions.lineCap = $(this).val()
    })


    // Brush shadow color
    $('#brush-shadow-color-picker').minicolors({
        control: 'wheel',
        format: 'rgb',
        opacity: true,
        changeDelay: 250,
        change: function (colorValue) {
            if ( colorValue === '' ) {
                brushOptions.shadowColor = ''
            } else {
                brushOptions.shadowColor = colorValue
            }
        }
    })


    // Brush shadow blur
    let brushShadowBlurSlider = $("#brush-shadow-blur-slider")

    brushShadowBlurSlider.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushShadowBlurSlider.on("slide slideStop", function(slideEvt) {
        brushOptions.shadowBlur = slideEvt.value
    })



    // Brush shadow offset X
    let brushShadowOffsetX = $("#brush-shadow-offset-x-slider")

    brushShadowOffsetX.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushShadowOffsetX.on("slide slideStop", function(slideEvt) {
        brushOptions.shadowX = slideEvt.value
    })


    // Brush shadow offset Y
    let brushShadowOffsetY = $("#brush-shadow-offset-y-slider")

    brushShadowOffsetY.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushShadowOffsetY.on("slide slideStop", function(slideEvt) {
        brushOptions.shadowY = slideEvt.value
    })


    // Mousemove event on temporary canvas
    $(temporaryCanvas).on('mousemove', (e) => {
        mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX
        mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY

        lastPageX = mouse.x
        lastPageY = mouse.y
    })



    // Download canvas image
    $('#download-canvas-image').on('click', function() {
        let generateLink = document.createElement('a')

        generateLink.download = "canvas-image-" + new Date().toLocaleString() + ".jpg"
        generateLink.href = canvas.toDataURL("image/jpg").replace("image/jpg", "image/octet-stream")

        generateLink.click()
        generateLink.remove()
    })



    // Mousedown event on temporary canvas
    $(temporaryCanvas).on('mousedown', (e) => {
        // Left click only for drawing
        if ( e.which === 1 ) {
            temporaryCanvasContext.shadowOffsetX = brushOptionsInitial.shadowX
            temporaryCanvasContext.shadowOffsetY = brushOptionsInitial.shadowY
            temporaryCanvasContext.shadowBlur    = brushOptionsInitial.shadowBlur
            temporaryCanvasContext.shadowColor   = brushOptionsInitial.shadowColor

            temporaryCanvasContext.lineJoin = brushOptionsInitial.lineCap

            if ( toolType === 'brush' ) {
                temporaryCanvasContext.lineWidth = brushOptions.size
                temporaryCanvasContext.strokeStyle = brushOptions.color
                temporaryCanvasContext.fillStyle = brushOptions.color

                temporaryCanvasContext.globalAlpha = brushOptions.opacity
                temporaryCanvasContext.lineCap = brushOptions.lineCap

                if ( $("#disable-tool-shadow").is(':checked') !== true ) {
                    temporaryCanvasContext.shadowOffsetX = brushOptions.shadowX
                    temporaryCanvasContext.shadowOffsetY = brushOptions.shadowY
                    temporaryCanvasContext.shadowBlur    = brushOptions.shadowBlur
                    temporaryCanvasContext.shadowColor   = brushOptions.shadowColor
                }
            } else {
                temporaryCanvasContext.lineWidth = eraserOptions.size
                temporaryCanvasContext.strokeStyle = eraserOptions.color
                temporaryCanvasContext.fillStyle = eraserOptions.color

                temporaryCanvasContext.globalAlpha = brushOptionsInitial.opacity
                temporaryCanvasContext.lineCap = brushOptionsInitial.lineCap
            }

            temporaryCanvas.addEventListener('mousemove', onPaint, false)

            mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX
            mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY

            lastPageX = mouse.x
            lastPageY = mouse.y

            graphPoints.push({x: mouse.x, y: mouse.y})

            onPaint()
        } else if ( toolType === 'brush' ) {
            let newBrushColor = getRandomRGB()

            brushColorPicker.val( newBrushColor )
            brushColorPicker.minicolors( 'value', newBrushColor );
        }
    })


    // Mouseup event on temporary canvas
    $(temporaryCanvas).on('mouseup', (e) => {
        temporaryCanvas.removeEventListener('mousemove', onPaint, false)

        // Writing down to real canvas now
        canvasContext.drawImage(temporaryCanvas, 0, 0)

        // Clearing temporary canvas
        temporaryCanvasContext.clearRect(0, 0, temporaryCanvas.width, temporaryCanvas.height)

        // Emptying up Pencil Points
        graphPoints = []
    })


    // Mousemove event on the whole document
    $(document).on('mousemove', (e) => {
    // $('.sidenav-left, .main-content').on('mousemove', (e) => {
        let mouseSizeOption = brushOptions.size

        if ( toolType === 'eraser' ) {
            mouseSizeOption = eraserOptions.size
        }

        lastPageX = e.pageX
        lastPageY = e.pageY

        $('#canvas-mouse-tool-show').css({
            left: e.pageX - ( 2 * Math.round( mouseSizeOption / 2 ) ) / 2,
            top: e.pageY - ( 2 * Math.round( mouseSizeOption / 2 ) ) / 2
        });
    })


    // Mouseenter event on temporary canvas
    $(temporaryCanvas).on('mouseenter', (e) => {
        $('#canvas-mouse-tool-show').removeClass('canvas-mouse-used')
        $('#canvas-mouse-tool-show').fadeIn(100)
    })


    // Mouseout event on temporary canvas
    $(temporaryCanvas).on('mouseout', (e) => {
        updateCanvasMouse()
    })


    // Paint onto the temporary canvas
    let onPaint = function() {
        // Saving all the points in an array
        graphPoints.push({x: mouse.x, y: mouse.y})

        if ( graphPoints.length < 3 ) {
            let b = graphPoints[0]

            temporaryCanvasContext.beginPath()

            temporaryCanvasContext.arc(b.x, b.y, temporaryCanvasContext.lineWidth / 2, 0, Math.PI * 2, !0)
            temporaryCanvasContext.fill()
            temporaryCanvasContext.closePath()

            return
        }

        // Temporary canvas is always cleared up before drawing.
        temporaryCanvasContext.clearRect(0, 0, temporaryCanvas.width, temporaryCanvas.height)

        temporaryCanvasContext.beginPath()
        temporaryCanvasContext.moveTo(graphPoints[0].x, graphPoints[0].y)

        let i

        for (i = 1; i < graphPoints.length - 2; i++) {
            let c = (graphPoints[i].x + graphPoints[i + 1].x) / 2
            let d = (graphPoints[i].y + graphPoints[i + 1].y) / 2

            temporaryCanvasContext.quadraticCurveTo(graphPoints[i].x, graphPoints[i].y, c, d)
        }

        // For the last 2 points
        temporaryCanvasContext.quadraticCurveTo(
            graphPoints[i].x,
            graphPoints[i].y,
            graphPoints[i + 1].x,
            graphPoints[i + 1].y
        )

        temporaryCanvasContext.stroke()
    }



    $('.tool-selector').on('click', function() {
        let button = $(this)

        if ( button && ! button.hasClass( 'disabled' ) ) {
            button.addClass('shortcut-click-animate')

            let toolSelected = false

            if ( button.is("#tool-brush-button") ) {
                toolSelected = 'brush'
            } else if ( button.is("#tool-eraser-button") ) {
                toolSelected = 'eraser'
            }

            if ( toolSelected !== false ) {
                toolType = toolSelected

                $('.tool-selector').removeClass('btn-primary disabled')
                $('.tool-selector').addClass('btn-secondary')

                button.removeClass('btn-secondary')
                button.addClass('btn-primary disabled')

                $('.canvas-controls-group-eraser').slideToggle(200);
                $('.canvas-controls-group-draw').slideToggle(200);

                updateCanvasMouse()
                updateCanvasCursor()
            }

            setTimeout(() => {
                button.removeClass('shortcut-click-animate')
            }, 500);
        }
    })


    // Clear canvas
    $('#canvas-clear-button').on('click', function() {
        let button = $(this)

        if ( button ) {
            button.addClass('shortcut-click-animate')

            canvasContext.clearRect(0, 0, canvas.width, canvas.height)

            setTimeout(() => {
                button.removeClass('shortcut-click-animate')
            }, 300);
        }
    })







    // Undo canvas action
    $('#canvas-undo-button').on('click', function() {
        let button = $(this)

        if ( button ) {
            button.addClass('shortcut-click-animate')

            // do the undo here

            setTimeout(() => {
                button.removeClass('shortcut-click-animate')
            }, 300);
        }
    })

    // http://jsfiddle.net/m1erickson/AEYYq/
    // https://codepen.io/abidibo/pen/rmGBc

    // Redo canvas action
    $('#canvas-redo-button').on('click', function() {
        let button = $(this)

        if ( button ) {
            button.addClass('shortcut-click-animate')

            // do the redo here

            setTimeout(() => {
                button.removeClass('shortcut-click-animate')
            }, 300);
        }
    })








    // Keyboard shortcut - q - toggle between brush and eraser
    $(document).on('keydown', null, 'q', function() {
        let button = false

        if ( toolType === 'brush' ) {
            button = $('#tool-eraser-button')
        } else if ( toolType === 'eraser' ) {
            button = $('#tool-brush-button')
        }

        if ( button !== false ) {
            button.click()
        }
    });


    // Keyboard shortcut - w - toggle shadow display checkbox
    $(document).on('keydown', null, 'w', function() {
        if ( toolType === 'brush' ) {
            let disableToolShadowCheckbox = $("#disable-tool-shadow")

            if ( disableToolShadowCheckbox.is(':checked') === true ) {
                disableToolShadowCheckbox.prop('checked', false)
            } else {
                disableToolShadowCheckbox.prop('checked', true)
            }
        }
    });


    // Keyboard shortcut - d - download canvas image
    $(document).on('keyup', null, 'd', function() {
        $('#download-canvas-image').click()
    });


    // Keyboard shortcut - c - toggle color picker modal
    $(document).on('keyup', null, 'c', function() {
        $('#canvas-color-picker-modal').modal('toggle')
    });


    $('#canvas-color-picker-modal, #canvas-settings-modal').on('hidden.bs.modal', function (e) {
        allowToolControls = true

        $('#canvas-mouse-tool-show').show()

        updateCanvasMouse()
    })


    $('#canvas-settings-modal').on('shown.bs.modal', function (e) {
        allowToolControls = false

        $('#canvas-mouse-tool-show').hide()
    })




    $('#canvas-color-picker-modal').on('shown.bs.modal', function (e) {
        allowToolControls = false
        $('#canvas-mouse-tool-show').hide()

        $( '.modal-color-picker-item' ).removeClass( 'item-selected' )

        modalColorPickerItemsCounter = 0

        console.log('modalColorPickerItemsCounter: ' + modalColorPickerItemsCounter);
        let squareItem = $( '.modal-color-picker-item-' + modalColorPickerItemsCounter )

        squareItem.addClass( 'item-selected' );

        modalColorPickerItemsCounter++
    })


    $(document).on('keydown', null, 'n', function() {
        console.log('going forward > : ');

        console.log('modalColorPickerItemsCounter: ' + modalColorPickerItemsCounter);

        $( '.modal-color-picker-item' ).removeClass( 'item-selected' )

        let squareItem = $( '.modal-color-picker-item-' + modalColorPickerItemsCounter )

        squareItem.addClass( 'item-selected' );

        if ( modalColorPickerItemsCounter === ( modalColorPickerItems.length - 1 ) ) {
            modalColorPickerItemsCounter = 0
        } else {
            modalColorPickerItemsCounter++
        }
    });

    //
    // $(document).on('keydown', null, 'b', function() {
    //     if ( modalColorPickerItemsCounter === 0 ) {
    //         modalColorPickerItemsCounter = modalColorPickerItems.length - 1
    //     }
    //
    //     modalColorPickerItemsCounter--
    //
    //     console.log('going back > : ');
    //
    //     console.log('modalColorPickerItemsCounter: ' + modalColorPickerItemsCounter);
    //
    //     $( '.modal-color-picker-item' ).removeClass( 'item-selected' )
    //
    //     let squareItem = $( '.modal-color-picker-item-' + modalColorPickerItemsCounter )
    //
    //     squareItem.addClass( 'item-selected' );
    //
    // });




    // Keyboard shortcut - r - clear canvas
    $(document).on('keydown', null, 'r', function() {
        $('#canvas-clear-button').click()
    });


    // Keyboard shortcut - s - toggle settings modal
    $(document).on('keydown', null, 's', function() {
        let button = $('#canvas-settings-button')

        button.addClass('shortcut-click-animate')

        button.click()

        setTimeout(() => {
            button.removeClass('shortcut-click-animate')
        }, 300);
    });


    // Keyboard shortcut - z - undo canvas action
    $(document).on('keydown', null, 'z', function() {
        $('#canvas-undo-button').click()
    });


    // Keyboard shortcut - x - redo canvas action
    $(document).on('keydown', null, 'x', function() {
        $('#canvas-redo-button').click()
    });


    // Keyboard shortcut - 1 - decrease opacity of brush
    $(document).on('keydown', null, '1', function() {
        if ( toolType === 'brush' ) {
            alterBrushOpacity('decrease')
        }
    });


    // Keyboard shortcut - 2 - increase opacity of brush
    $(document).on('keydown', null, '2', function() {
        if ( toolType === 'brush' ) {
            alterBrushOpacity('increase')
        }
    });

    function alterBrushOpacity(action) {
        if ( toolType === 'brush' && allowToolControls ) {
            let newOpacity = brushOptions.opacity

            if ( action === 'increase' ) {
                newOpacity += 0.05
            } else {
                newOpacity -= 0.05
            }

            if ( newOpacity >= 0.1 && newOpacity <= 1 ) {
                brushOpacitySlider.slider( 'setValue', newOpacity );

                brushOptions.opacity = newOpacity

                updateCanvasMouse('opacity')
            }
        }
    }


    $( document ).on('mousewheel DOMMouseScroll', function(e) {
        if ( allowToolControls ) {
            if(typeof e.originalEvent.detail == 'number' && e.originalEvent.detail !== 0) {
                if(e.originalEvent.detail > 0) {
                    alterToolSize('decrease')
                } else if(e.originalEvent.detail < 0){
                    alterToolSize('increase')
                }
            } else if (typeof e.originalEvent.wheelDelta == 'number') {
                if(e.originalEvent.wheelDelta < 0) {
                    alterToolSize('decrease')
                } else if(e.originalEvent.wheelDelta > 0) {
                    alterToolSize('increase')
                }
            }
        }
    });


    function alterToolSize(action) {
        if ( toolType === 'eraser' ) {
            let newSize = eraserOptions.size

            if ( action === 'increase' ) {
                newSize += 15
            } else {
                newSize -= 15
            }

            if ( newSize > 11 && newSize < 301 ) {
                eraserSizeSlider.slider( 'setValue', newSize );

                eraserOptions.size = newSize

                updateCanvasMouse('size')
            }
        } else if ( toolType === 'brush' ) {
            let newSize = brushOptions.size

            if ( action === 'increase' ) {
                newSize += 15
            } else {
                newSize -= 15
            }

            if ( newSize > 11 && newSize < 301 ) {
                brushSizeSlider.slider( 'setValue', newSize );

                brushOptions.size = newSize

                updateCanvasMouse('size')
            }
        }
    }


    // Update canvas mouse
    function updateCanvasMouse(action) {
        if ( allowToolControls ) {
            let mouseSizeOption = brushOptions.size
            let mouseColor = brushOptions.color

            if ( toolType === 'eraser' ) {
                mouseSizeOption = eraserOptions.size
                mouseColor = eraserOptions.color
            }

            let mouseSize = 2 * Math.round( mouseSizeOption / 2 )

            let mouseCSS = {
                'left': lastPageX - ( 2 * Math.round( mouseSizeOption / 2 ) ) / 2,
                'top': lastPageY - ( 2 * Math.round( mouseSizeOption / 2 ) ) / 2,
                'width': mouseSize,
                'height': mouseSize,
                'background': mouseColor,
                'border-radius': mouseSize / 2,
                '-moz-border-radius': mouseSize / 2,
                '-webkit-border-radius':  mouseSize / 2
            }

            $('#canvas-mouse-tool-show').css( mouseCSS )

            if ( action === 'size' || action === 'opacity' || action === 'color' ) {
                if ( $('#canvas-mouse-tool-show').hasClass('canvas-mouse-used') ) {
                    $('#canvas-mouse-tool-show').addClass('canvas-mouse-used')
                }
            } else {
                if ( toolType === 'eraser' ) {
                    $('#canvas-mouse-tool-show').removeClass('canvas-mouse-used')
                } else {
                    $('#canvas-mouse-tool-show').addClass('canvas-mouse-used')
                }
            }

            $('#canvas-mouse-tool-show').fadeIn(100)
        } else {
            $('#canvas-mouse-tool-show').hide()
        }
    }



    // Update canvas cursor
    function updateCanvasCursor() {
        let canvasCursorIcon = 'paint-brush'

        if ( toolType === 'eraser' ) {
            canvasCursorIcon = 'eraser'
        }

        $(temporaryCanvas).awesomeCursor(canvasCursorIcon, {
            hotspot: [0, 17],
            size: 20,
            color: canvasCursorColor
        })
    }


    // Update random RGB color
    function getRandomRGB() {
        let num = Math.round(0xffffff * Math.random())

        let r = num >> 16
        let g = num >> 8 & 255
        let b = num & 255

        return 'rgb(' + r + ', ' + g + ', ' + b + ')'
    }
})
