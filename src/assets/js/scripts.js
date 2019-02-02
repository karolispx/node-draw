$(document).ready(() => {
    // Generate 'unique' user socket ID
    let socketUserID = Math.floor(100000000 + Math.random() * 900000000) + '-' + Math.floor(100000000 + Math.random() * 900000000)


    // Connect to a socket
    let socket = io.connect({
        query: 'userid=' + socketUserID
    })


    // counter event - update users onine
    socket.on( 'counter', function (data) {
        if ( data && Number.isInteger( data ) ) {
            $(".user-counter").text( data )
        }
    });



    // Elements
    let pagePreloader = $('.page-preloader')
    let canvasShortcutsButton = $('#canvas-shortcuts-button')
    let toolSelectorButton = $('.tool-selector-button')
    let canvasMouseToolShow = $( '#canvas-mouse-tool-show' )
    let eraserSizeSlider = $("#eraser-size-slider")
    let brushColorPicker = $("#brush-color-picker")
    let brushSizeSlider = $("#brush-size-slider")
    let brushOpacitySlider = $("#brush-opacity-slider")
    let brushShadowBlurSlider = $("#brush-shadow-blur-slider")
    let brushShadowOffsetX = $("#brush-shadow-offset-x-slider")
    let brushShadowOffsetY = $("#brush-shadow-offset-y-slider")
    let downloadCanvasImageButton = $('#download-canvas-image-button')
    let disableToolShadowCheckbox = $("#disable-tool-shadow-checkbox")
    let canvasColorPickerModal = $('#canvas-color-picker-modal')
    let canvasHelpModal = $('#canvas-help-modal')
    let canvasClearButton = $('#canvas-clear-button')
    let shortcutTooltipHelpersBrush = $('.shortcut-tooltip-helpers-brush')
    let shortcutTooltipHelpersEraser = $('.shortcut-tooltip-helpers-eraser')
    let canvasHelpButton = $('#canvas-help-button')
    let canvasCursorColorPicker = $('#canvas-cursor-color-picker')
    let brushLineCapDropdown = $('#brush-line-cap-dropdown')
    let brushShadowColorPicker = $('#brush-shadow-color-picker')
    let canvasControlsGroupEraser = $('.canvas-controls-group-eraser')
    let canvasControlsGroupBrush = $('.canvas-controls-group-brush')


    // Variables
    let toolSizeMax = 300
    let toolSizeMin = 1

    let brushOpacityMin = 0.1
    let brushOpacityMax = 1

    let shortcutTooltipHelpersClass = 'shortcut-tooltip-helpers'
    let canvasMouseUsedClass = 'canvas-mouse-used'
    let shortcutClickAnimateClass = 'shortcut-click-animate'
    let shortcutClickAnimateDisabledClass = 'shortcut-click-animate disabled'

    let sliderInputEvents = 'slide slideStop'

    let pressedShortcutQ = false
    let showingTooltips = false

    let drawingOnCanvas = false

    let mouse = {x: 0, y: 0}

    let lastPageX = 0
    let lastPageY = 0

    let graphPoints = []

    let swatchColors = []

    for ( var i = 1; i < 15; i++ ) {
        swatchColors.unshift(getRandomColor(true))
    }

    loadModalColorPickerColors()

    // Load modal color picker colors
    function loadModalColorPickerColors() {
        $('.modal-color-picker-item-container').each(function( index ) {
            let item = $( this )
            let color = swatchColors[index]

            item.html( '<div data-color="' + color + '" style="background: ' + color + '" class="modal-color-picker-item"><span>' + color + '</span></div>'  )
        });
    }

    let initialBrushColor = getRandomColor(true)
    let toolType = 'brush'

    let brushOptions = {
        'size': 25,
        'opacity': 1,
        'color': initialBrushColor,
        'lineCap': 'round',
        'shadowdisabled': false,
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




    // Set up Canvas
    let canvasContainer = $('#canvas-container')

    let canvas = document.getElementById('actual-canvas');
    let canvasContext = canvas.getContext('2d')

    let temporaryCanvas = document.getElementById('temporary-canvas');
    let temporaryCanvasContext = temporaryCanvas.getContext('2d')

    let canvasContainerWidth = canvasContainer.outerWidth()
    let canvasContainerHeight = canvasContainer.outerHeight()

    canvas.setAttribute("width", canvasContainerWidth);
    canvas.setAttribute("height", canvasContainerHeight);
    canvas.style.width = canvasContainerWidth + "px";
    canvas.style.height = canvasContainerHeight + "px";
    canvasContext.canvas.width = canvasContainerWidth
    canvasContext.canvas.height = canvasContainerHeight

    temporaryCanvas.setAttribute("width", canvasContainerWidth);
    temporaryCanvas.setAttribute("height", canvasContainerHeight);
    temporaryCanvas.style.width = canvasContainerWidth + "px";
    temporaryCanvas.style.height = canvasContainerHeight + "px";
    temporaryCanvasContext.canvas.width = canvasContainerWidth
    temporaryCanvasContext.canvas.height = canvasContainerHeight



    // Page preloader
    setTimeout(function() {
        pagePreloader.remove('.page-preloader')
        pagePreloader.fadeOut(500)
    }, 1000)


    updateCanvasCursor()
    updateCanvasMouse()



    $(temporaryCanvas).contextmenu(function(e) {
        e.preventDefault();
        e.stopPropagation();
    });



    // Canvas cursor color
    canvasCursorColorPicker.minicolors({
        control: 'wheel',
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
    eraserSizeSlider.slider({
        min: toolSizeMin,
        max: toolSizeMax,
        step: 1,
        value: 25,
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    eraserSizeSlider.on(sliderInputEvents, function(slideEvt) {
        eraserOptions.size = parseInt(slideEvt.value)

        updateCanvasMouse()
    })


    // Brush color
    brushColorPicker.val( initialBrushColor )

    brushColorPicker.minicolors({
        format: 'hex',
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
    brushSizeSlider.slider({
        min: toolSizeMin,
        max: toolSizeMax,
        step: 1,
        value: 25,
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushSizeSlider.on(sliderInputEvents, function(slideEvt) {
        brushOptions.size = parseInt(slideEvt.value)

        updateCanvasMouse()
    })



    // Brush opacity
    brushOpacitySlider.slider({
        min: brushOpacityMin,
        max: brushOpacityMax,
        step: 0.01,
        value: 1,
        tooltip: 'always',
        formatter: function(value) {
            return value
        }
    })

    brushOpacitySlider.on(sliderInputEvents, function(slideEvt) {
        brushOptions.opacity = slideEvt.value
    })



    // Brush line cap
    brushLineCapDropdown.change(function() {
        brushOptions.lineCap = $(this).val()
    })



    // Brush shadow color
    brushShadowColorPicker.minicolors({
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
    brushShadowBlurSlider.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushShadowBlurSlider.on(sliderInputEvents, function(slideEvt) {
        brushOptions.shadowBlur = slideEvt.value
    })



    // Brush shadow offset X
    brushShadowOffsetX.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushShadowOffsetX.on(sliderInputEvents, function(slideEvt) {
        brushOptions.shadowX = slideEvt.value
    })



    // Brush shadow offset Y
    brushShadowOffsetY.slider({
        tooltip: 'always',
        formatter: function(value) {
            return value + 'px'
        }
    })

    brushShadowOffsetY.on(sliderInputEvents, function(slideEvt) {
        brushOptions.shadowY = slideEvt.value
    })



    // Download canvas image
    downloadCanvasImageButton.on('click', function() {
        let button = $( this )

        if ( button && ! button.hasClass( 'disabled' ) ) {
            button.addClass(shortcutClickAnimateDisabledClass)

            let generateLink = document.createElement('a')

            generateLink.download = "canvas-image-" + new Date().toLocaleString() + ".jpg"
            generateLink.href = canvas.toDataURL("image/jpg").replace("image/jpg", "image/octet-stream")

            generateLink.click()
            generateLink.remove()

            setTimeout(() => {
                button.removeClass(shortcutClickAnimateDisabledClass)
            }, 1000);
        }
    })



    // Mousemove event on temporary canvas
    $(temporaryCanvas).on('mousemove', (e) => {
        mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX
        mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY

        lastPageX = mouse.x
        lastPageY = mouse.y

        selfDraw()
    })

    // Mousedown event on temporary canvas
    $(temporaryCanvas).on('mousedown', (e) => {
        // Left click only for drawing
        if ( e.which === 1 ) {
            drawingOnCanvas = true

            mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX
            mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY

            lastPageX = mouse.x
            lastPageY = mouse.y

            graphPoints.push({x: mouse.x, y: mouse.y})

            selfDraw()
        } else if ( e.which === 3 && toolType === 'brush' ) {
            setTimeout(() => {
                canvasColorPickerModal.modal('toggle')
            }, 100);
        }
    })


    // Mouseup event on temporary canvas
    $(temporaryCanvas).on('mouseup', (e) => {
        selfDraw(true)
    })



    // Mousemove event on the whole document
    $(document).on('mousemove', (e) => {
        let mouseSizeOption = brushOptions.size

        if ( toolType === 'eraser' ) {
            mouseSizeOption = eraserOptions.size
        }

        lastPageX = e.pageX
        lastPageY = e.pageY

        canvasMouseToolShow.css({
            left: lastPageX - ( 2 * Math.round( mouseSizeOption / 2 ) ) / 2,
            top: lastPageY - ( 2 * Math.round( mouseSizeOption / 2 ) ) / 2
        })
    })


    // Drawing on canvas by user
    function selfDraw(end) {
        if ( drawingOnCanvas ) {
            // Saving all the points in an array
            graphPoints.push({x: mouse.x, y: mouse.y})

            let data = {
                points: graphPoints,
                shadowdisabled: disableToolShadowCheckbox.is(':checked'),
                tooltype: toolType,
                socketuser: socketUserID
            }

            if ( toolType === 'brush' ) {
                data.tooloptions = brushOptions
            } else {
                data.tooloptions = eraserOptions
            }


            if ( end === true ) {
                drawingOnCanvas = false

                // Writing down to real canvas now
                canvasContext.drawImage(temporaryCanvas, 0, 0)

                // Clearing temporary canvas
                temporaryCanvasContext.clearRect(0, 0, temporaryCanvas.width, temporaryCanvas.height)

                let dataEmit = {
                    points: graphPoints,
                    shadowdisabled: disableToolShadowCheckbox.is(':checked'),
                    tooltype: toolType,
                    socketuser: socketUserID
                }

                if ( toolType === 'brush' ) {
                    dataEmit.tooloptions = brushOptions
                } else {
                    dataEmit.tooloptions = eraserOptions
                }

                socket.emit('draw-on-canvas', dataEmit);

                // Emptying up Pencil Points
                graphPoints = []
            } else {
                onDraw(data)
            }
        }
    }



    // Drawing on canvas by user/other users
    function onDraw(data) {
        let drawGraphPoints = data.points
        let drawToolType = data.tooltype
        let drawToolOptions = data.tooloptions
        let shadowDisabled = data.shadowdisabled

        temporaryCanvasContext.shadowOffsetX = brushOptionsInitial.shadowX
        temporaryCanvasContext.shadowOffsetY = brushOptionsInitial.shadowY
        temporaryCanvasContext.shadowBlur    = brushOptionsInitial.shadowBlur
        temporaryCanvasContext.shadowColor   = brushOptionsInitial.shadowColor

        temporaryCanvasContext.lineJoin = brushOptionsInitial.lineCap

        if ( drawToolType === 'brush' ) {
            temporaryCanvasContext.lineWidth = drawToolOptions.size
            temporaryCanvasContext.strokeStyle = drawToolOptions.color
            temporaryCanvasContext.fillStyle = drawToolOptions.color

            temporaryCanvasContext.globalAlpha = drawToolOptions.opacity
            temporaryCanvasContext.lineCap = drawToolOptions.lineCap

            if ( shadowDisabled !== true ) {
                temporaryCanvasContext.shadowOffsetX = drawToolOptions.shadowX
                temporaryCanvasContext.shadowOffsetY = drawToolOptions.shadowY
                temporaryCanvasContext.shadowBlur    = drawToolOptions.shadowBlur
                temporaryCanvasContext.shadowColor   = drawToolOptions.shadowColor
            }
        } else {
            temporaryCanvasContext.lineWidth = drawToolOptions.size
            temporaryCanvasContext.strokeStyle = drawToolOptions.color
            temporaryCanvasContext.fillStyle = drawToolOptions.color

            temporaryCanvasContext.globalAlpha = brushOptionsInitial.opacity
            temporaryCanvasContext.lineCap = brushOptionsInitial.lineCap
        }

        if ( drawGraphPoints.length < 3 ) {
            let b = drawGraphPoints[0]

            temporaryCanvasContext.beginPath()

            temporaryCanvasContext.arc(b.x, b.y, temporaryCanvasContext.lineWidth / 2, 0, Math.PI * 2, !0)
            temporaryCanvasContext.fill()
            temporaryCanvasContext.closePath()
        } else {
            // Temporary canvas is always cleared up before drawing.
            temporaryCanvasContext.clearRect(0, 0, temporaryCanvas.width, temporaryCanvas.height)

            temporaryCanvasContext.beginPath()
            temporaryCanvasContext.moveTo(drawGraphPoints[0].x, drawGraphPoints[0].y)

            let i

            for (i = 1; i < drawGraphPoints.length - 2; i++) {
                let c = (drawGraphPoints[i].x + drawGraphPoints[i + 1].x) / 2
                let d = (drawGraphPoints[i].y + drawGraphPoints[i + 1].y) / 2

                temporaryCanvasContext.quadraticCurveTo(drawGraphPoints[i].x, drawGraphPoints[i].y, c, d)
            }

            // For the last 2 points
            temporaryCanvasContext.quadraticCurveTo(
                drawGraphPoints[i].x,
                drawGraphPoints[i].y,
                drawGraphPoints[i + 1].x,
                drawGraphPoints[i + 1].y
            )

            temporaryCanvasContext.stroke()
        }

    }



    // Event coming from sockets - somebody drew on canvas
    socket.on('draw-on-canvas', function (data) {
        if ( data && data.socketuser === socketUserID ) {
            return null
        } else {
            if ( data ) {
                onDraw(data)

                canvasContext.drawImage(temporaryCanvas, 0, 0)
                temporaryCanvasContext.clearRect(0, 0, temporaryCanvas.width, temporaryCanvas.height)
            }
        }
    })



    // Mouseenter event on temporary canvas
    $(temporaryCanvas).on('mouseenter', (e) => {
        canvasMouseToolShow.removeClass(canvasMouseUsedClass)
        canvasMouseToolShow.fadeIn(100)
    })


    // Mouseout event on temporary canvas
    $(temporaryCanvas).on('mouseout', (e) => {
        updateCanvasMouse()
    })



    // Keyboard shortcut - q - toggle between brush and eraser
    $(document).on('keydown', null, 'q', function() {
        toolSelectorButton.click()
    });


    toolSelectorButton.on('click', function() {
        if ( showingTooltips === true ) {
            canvasShortcutsButton.click()
        }

        let button = $(this)

        if ( pressedShortcutQ !== true && button && ! button.hasClass( 'disabled' ) ) {
            button.addClass(shortcutClickAnimateClass)

            let toolSelected = false

            if ( button.is("#tool-brush-button") ) {
                toolSelected = 'brush'
            } else if ( button.is("#tool-eraser-button") ) {
                toolSelected = 'eraser'
            }

            if ( toolSelected !== false ) {
                pressedShortcutQ = true

                toolType = toolSelected

                toolSelectorButton.removeClass('btn-primary disabled')
                toolSelectorButton.addClass('btn-secondary')

                button.removeClass('btn-secondary')
                button.addClass('btn-primary disabled')

                canvasControlsGroupEraser.slideToggle(200);
                canvasControlsGroupBrush.slideToggle(200);

                updateCanvasMouse()
                updateCanvasCursor()
            }

            setTimeout(() => {
                button.removeClass(shortcutClickAnimateClass)
                pressedShortcutQ = false
            }, 300);

        }
    })


    // Keyboard shortcut - w - toggle shadow display checkbox
    $(document).on('keydown', null, 'w', function() {
        if ( toolType === 'brush' ) {
            if ( disableToolShadowCheckbox.is(':checked') === true ) {
                disableToolShadowCheckbox.prop('checked', false)
            } else {
                disableToolShadowCheckbox.prop('checked', true)
            }
        }
    });



    // Keyboard shortcut - d - download canvas image
    $(document).on('keyup', null, 'd', function() {
        downloadCanvasImageButton.click()
    });


    // Keyboard shortcut - c - Choose random color
    $(document).on('keyup', null, 'c', function() {
        if (toolType === 'brush' ) {
            // Right mouse click
            let newBrushColor = getRandomColor(true)

            brushColorPicker.val( newBrushColor )
            brushColorPicker.minicolors( 'value', newBrushColor )

            swatchColors.unshift( newBrushColor )
            swatchColors.pop()

            loadModalColorPickerColors()
        }
    });



    canvasHelpModal.on('hidden.bs.modal', function (e) {
        allowToolControls = true

        canvasMouseToolShow.show()

        updateCanvasMouse()
    })

    canvasHelpModal.on('shown.bs.modal', function (e) {
        allowToolControls = false

        canvasMouseToolShow.hide()
    })



    $(canvasColorPickerModal).on('hidden.bs.modal', function (e) {
        allowToolControls = true

        canvasMouseToolShow.show()

        updateCanvasMouse()
    })

    canvasColorPickerModal.on('shown.bs.modal', function (e) {
        allowToolControls = false
        canvasMouseToolShow.hide()
    })


    $(document).on( 'click', '.modal-color-picker-item', function() {
        let colorSelected = $( this ).data("color")

        if ( colorSelected ) {
            canvasColorPickerModal.modal('hide')

            brushColorPicker.val( colorSelected )
            brushColorPicker.minicolors( 'value', colorSelected );
        }
    });



    // Keyboard shortcut - r - clear canvas
    $(document).on('keydown', null, 'r', function() {
        canvasClearButton.click()
    });


    // Clear canvas
    canvasClearButton.on('click', function() {
        let button = $(this)

        if ( button ) {
            button.addClass(shortcutClickAnimateClass)

            canvasContext.clearRect(0, 0, canvas.width, canvas.height)

            setTimeout(() => {
                button.removeClass(shortcutClickAnimateClass)
            }, 300);
        }
    })



    // Keyboard shortcut - t - toggle shortcut helper tooltips
    $(document).on('keydown', null, 't', function() {
        canvasShortcutsButton.click()
    });

    // Toggle on shortcut helper tooltip
    canvasShortcutsButton.on('click', function() {
        let button = $( this )

        if ( toolType === 'brush' ) {
            shortcutTooltipHelpersBrush.addClass(shortcutTooltipHelpersClass)
            shortcutTooltipHelpersEraser.removeClass(shortcutTooltipHelpersClass)
        } else {
            shortcutTooltipHelpersEraser.addClass(shortcutTooltipHelpersClass)
            shortcutTooltipHelpersBrush.removeClass(shortcutTooltipHelpersClass)
        }

        if ( button && ! button.hasClass( 'disabled' ) ) {
            button.addClass(shortcutClickAnimateDisabledClass)

            if ( showingTooltips ) {
                showingTooltips = false
                let shortcutTooltipHelpers = $('.shortcut-tooltip-helpers')

                shortcutTooltipHelpers.tooltip('hide')
                shortcutTooltipHelpers.tooltip('disable')
            } else {
                showingTooltips = true

                let shortcutTooltipHelpers = $('.shortcut-tooltip-helpers')

                shortcutTooltipHelpers.tooltip('enable')
                shortcutTooltipHelpers.tooltip('show')
            }

            setTimeout(() => {
                button.removeClass(shortcutClickAnimateDisabledClass)
            }, 300);
        }
    })


    
    // Keyboard shortcut - h - toggle help modal
    $(document).on('keydown', null, 'h', function() {
        canvasHelpButton.click()
    });

    // Canvas help button click
    canvasHelpButton.on('click', function() {
        let button = $( this )

        if ( button && ! button.hasClass( 'disabled' ) ) {
            button.addClass(shortcutClickAnimateDisabledClass)
            canvasHelpModal.modal('toggle')

            setTimeout(() => {
                button.removeClass(shortcutClickAnimateDisabledClass)
            }, 1000);
        }
    })


    // Keyboard shortcut - 1 - decrease opacity of brush
    $(document).on('keydown', null, '1', function() {
        alterBrushOpacity('decrease')
    });


    // Keyboard shortcut - 2 - increase opacity of brush
    $(document).on('keydown', null, '2', function() {
        alterBrushOpacity('increase')
    });



    // Alter brush opacity - increase/decrease opacity of brush
    function alterBrushOpacity(action) {
        if ( toolType === 'brush' && allowToolControls ) {
            let brushOpacityAlter = 0.05

            let currentBrushOpacity = brushOptions.opacity

            if ( currentBrushOpacity <= brushOpacityMax && currentBrushOpacity >= brushOpacityMin ) {
                let newBrushOpacity = currentBrushOpacity

                if ( action === 'increase' ) {
                    if ( currentBrushOpacity > ( brushOpacityMax - brushOpacityAlter ) ) {
                        brushOpacityAlter = brushOpacityMax - currentBrushOpacity
                    }

                    newBrushOpacity += brushOpacityAlter
                } else {
                    if ( currentBrushOpacity < ( brushOpacityMin + brushOpacityAlter ) ) {
                        brushOpacityAlter = currentBrushOpacity - brushOpacityMin
                    }

                    newBrushOpacity -= brushOpacityAlter
                }

                if ( newBrushOpacity > 0.1 && newBrushOpacity < 1 ) {
                    newBrushOpacity = parseFloat((Math.ceil( newBrushOpacity * 20 - 0.5 ) / 20 ).toFixed(2))
                }

                brushOpacitySlider.slider( 'setValue', newBrushOpacity );

                brushOptions.opacity = newBrushOpacity

                updateCanvasMouse('opacity')
            }
        }
    }


    // Capture scroll event on canvas (tool size alter)
    $(temporaryCanvas).on('mousewheel DOMMouseScroll', function(e) {
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
    });


    // Alter tool size - increase/decrease size of brush/eraser
    function alterToolSize(action) {
        if ( allowToolControls && ( toolType === 'brush' || toolType === 'eraser' ) ) {
            let toolSizeAlter = 20

            let currentToolSize = toolSizeAlter
            let newToolSize = toolSizeAlter

            if ( toolType === 'brush' ) {
                currentToolSize = brushOptions.size
            } else {
                currentToolSize = eraserOptions.size
            }

            if ( currentToolSize <= toolSizeMax && currentToolSize >= toolSizeMin ) {
                newToolSize = currentToolSize

                if ( action === 'increase' ) {
                    if ( currentToolSize > ( toolSizeMax - toolSizeAlter ) ) {
                        toolSizeAlter = toolSizeMax - currentToolSize
                    }

                    newToolSize += toolSizeAlter
                } else {
                    if ( currentToolSize < ( toolSizeMin + toolSizeAlter ) ) {
                        toolSizeAlter = currentToolSize - toolSizeMin
                    }

                    newToolSize -= toolSizeAlter
                }

                if ( newToolSize > 10 ) {
                    newToolSize = Math.round( newToolSize / 10 ) * 10
                }

                if ( toolType === 'brush' ) {
                    brushSizeSlider.slider( 'setValue', newToolSize );

                    brushOptions.size = newToolSize
                } else {
                    eraserSizeSlider.slider( 'setValue', newToolSize );

                    eraserOptions.size = newToolSize
                }

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

            canvasMouseToolShow.css( mouseCSS )

            if ( action === 'size' || action === 'opacity' || action === 'color' ) {
                if ( canvasMouseToolShow.hasClass(canvasMouseUsedClass) ) {
                    canvasMouseToolShow.addClass(canvasMouseUsedClass)
                }
            } else {
                if ( toolType === 'eraser' ) {
                    canvasMouseToolShow.removeClass(canvasMouseUsedClass)
                } else {
                    canvasMouseToolShow.addClass(canvasMouseUsedClass)
                }
            }

            canvasMouseToolShow.fadeIn(100)
        } else {
            canvasMouseToolShow.hide()
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


    // Get random color (RGB/HEX)
    function getRandomColor(hex) {
        if ( hex === true ) {
            return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)})
        } else {
            let num = Math.round(0xffffff * Math.random())

            let r = num >> 16
            let g = num >> 8 & 255
            let b = num & 255

            return 'rgb(' + r + ', ' + g + ', ' + b + ')'
        }

    }
})
