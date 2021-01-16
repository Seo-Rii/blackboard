let canvas, tCanvas, isDrawing, points = []
let brush = new Image()
brush.src = 'http://www.tricedesigns.com/wp-content/uploads/2012/01/brush2.png'

function getCtx(canv) {
    let ctx
    ctx = canv.getContext("2d")
    ctx['imageSmoothingEnabled'] = true
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    if (selectedControl === 2) {
        ctx.lineWidth = selectedThick * 10 + 10
        ctx.strokeStyle = '#ffffff'
    } else {
        ctx.lineWidth = selectedThick + 1
        ctx.strokeStyle = colorList[selectedColor]
    }
    ctx.filter = 'none'
    return ctx
}

function distanceBetween(point1, point2) {
    return Math.sqrt(Math.pow(point2.x * canvas.width - point1.x * canvas.width, 2) + Math.pow(point2.y * canvas.height - point1.y * canvas.height, 2));
}

function angleBetween(point1, point2) {
    return Math.atan2(point2.x * canvas.width - point1.x * canvas.width, point2.y * canvas.height - point1.y * canvas.height);
}


window.addEventListener('load', () => {
    canvas = document.getElementById("mainCanv")
    tCanvas = document.getElementById("drawCanv")
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    tCanvas.width = canvas.offsetWidth
    tCanvas.height = canvas.offsetHeight
    tCanvas.onmousedown = drawStart
    window.onmousemove = drawing
    window.onmouseup = drawEnd
    for (let i of pointLi) {
        selectedThick = i.w
        selectedColor = i.c
        selectedControl = i.t
        let ctx = getCtx(canvas)
        if (selectedControl === 1) ctx.filter = getNewColor(colorList[selectedColor])
        draw(ctx, JSON.parse(i.point))
    }
    selectedThick = 0
    selectedColor = 0
    selectedControl = 0
    showSyncStat(true)
})

function draw(ctx, li) {
    showSyncStat(false)
    if (selectedControl === 1) {
        for (let j = 1; j < li.length; j++) {
            let lastPoint = li[j - 1]
            let currentPoint = li[j]
            let dist = distanceBetween(lastPoint, currentPoint)
            let angle = angleBetween(lastPoint, currentPoint)

            for (let i = 0; i < dist; i++) {
                let x = lastPoint.x * canvas.width + (Math.sin(angle) * i) - 25
                let y = lastPoint.y * canvas.height + (Math.cos(angle) * i) - 25
                ctx.drawImage(brush, x, y, 10 * selectedThick + 20, 10 * selectedThick + 20)
            }
        }
    } else {
        ctx.moveTo(li[0].x, li[0].y)
        ctx.beginPath()
        let p1 = li[0]
        let p2 = li[0]
        for (let i = 1; i < li.length; i++) {
            let midPoint = midPointBtw(p1, p2)
            ctx.quadraticCurveTo(p1.x * canvas.width, p1.y * canvas.height, midPoint.x * canvas.width, midPoint.y * canvas.height)
            p1 = li[i]
            p2 = li[i + 1]
        }
        ctx.stroke()
        ctx.closePath()
    }
}

function midPointBtw(p1, p2) {
    return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
    }
}

function drawStart(e) {
    points = []
    points.push({x: e.clientX / tCanvas.width, y: e.clientY / tCanvas.height})
    isDrawing = true
}

function drawEnd(e) {
    if (isDrawing) {
        isDrawing = false
        document.getElementById('controls').classList.add('closed')
        document.getElementById('controls').classList.remove('hidden')
        document.getElementById('controls').classList.remove('open')
        getCtx(tCanvas).clearRect(0, 0, tCanvas.width, tCanvas.height)
        if (selectedControl === 1) {
            let ctx = getCtx(canvas)
            ctx.filter = getNewColor(colorList[selectedColor])
            draw(ctx, points)
        } else draw(getCtx(canvas), points)
        let str = JSON.stringify({
            point: JSON.stringify(points),
            c: selectedColor,
            w: selectedThick,
            t: selectedControl
        })
        fetch('draw', {method: 'POST', body: str})
        socket.send(str)
        setTimeout(() => {
            showSyncStat(true)
        }, 500)
    }
}

function drawing(e) {
    if (isDrawing) {
        if (selectedControl === 1) tCanvas.style.filter = getNewColor(colorList[selectedColor])
        else tCanvas.style.filter = ''
        points.push({x: e.clientX / tCanvas.width, y: e.clientY / tCanvas.height})
        getCtx(tCanvas).clearRect(0, 0, tCanvas.width, tCanvas.height)
        draw(getCtx(tCanvas), points)
    }
}