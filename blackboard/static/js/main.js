let controls, selectedControl, selectedThick, selectedColor
let controlMargin = [-10, -110, -220]
let colorList = ['#000000', '#f55d49', '#f5b049', '#ede96f', '#85e68a', '#87d9ed', '#4d5ce3', '#b96fed', '#8a8a8a']
let shareDialog, infoDialog, resetDialog
let menu, drawer

let title, titleInput, updatingTitle = false

function showSnackbar(str) {
    document.getElementById('snackbar-text').innerText = str
    snackbar.close()
    snackbar.open()
}

function selectPen(penNo) {
    document.querySelectorAll('.pen').forEach(el => {
        el.classList.remove('selected')
    })
    document.querySelectorAll('.pen')[penNo].classList.add('selected')
    selectedControl = penNo
}

function selectThick(thickNo) {
    document.getElementById('thick-container').querySelectorAll('div').forEach(el => {
        el.classList.remove('selected')
    })
    document.getElementById('thick-container').querySelectorAll('div')[thickNo].classList.add('selected')
    selectedThick = thickNo
}


function selectColor(colorNo) {
    document.getElementById('color-container').querySelectorAll('div').forEach(el => {
        el.classList.remove('selected')
    })
    document.getElementById('color-container').querySelectorAll('div')[colorNo].classList.add('selected')
    document.querySelectorAll('.pen').forEach(el => {
        if (el.id === 'eraser') return
        el.style.filter = getNewColor(colorList[colorNo])
    })
    document.getElementById('thick-container').querySelectorAll('div').forEach(el => {
        if (el.id === 'eraser') return
        el.style.filter = getNewColor(colorList[colorNo])
    })
    selectedColor = colorNo
}

function share() {
    document.getElementById('shareUrl').value = location.href
    shareDialog.open()
}

function copyShareUrl() {
    navigator.clipboard.writeText(location.href).then(() => {
        showSnackbar('링크를 클립보드로 복사했어요.')
        shareDialog.close()
    }).catch(() => {
        showSnackbar('복사에 실패했어요. 수동으로 복사해주세요.')
    })
}

function reset() {
    fetch('reset').then(() => {
        location.reload()
    })
}

function showSyncStat(stat) {
    if (stat) {
        document.getElementById('synced').classList.remove('hide')
        document.getElementById('syncing').classList.add('hide')
    } else {
        document.getElementById('synced').classList.add('hide')
        document.getElementById('syncing').classList.remove('hide')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showSyncStat(false)
    controls = document.getElementById('controls')
    title = document.getElementById('title')
    titleInput = document.getElementById('title-input')

    document.getElementById('control-container').style.left = `-10px`
    controls.addEventListener('mouseover', () => {
        if (isDrawing) {
            document.getElementById('controls').classList.remove('closed')
            document.getElementById('controls').classList.remove('open')
            document.getElementById('controls').classList.add('hidden')
        } else {
            document.getElementById('controls').classList.remove('hidden')
            document.getElementById('controls').classList.remove('closed')
            document.getElementById('controls').classList.add('open')
            document.getElementById('control-container').style.left = `0`
        }
    })
    controls.addEventListener('mouseleave', () => {
        document.getElementById('controls').classList.add('closed')
        document.getElementById('controls').classList.remove('hidden')
        document.getElementById('controls').classList.remove('open')
        document.getElementById('control-container').style.left = `${controlMargin[selectedControl]}px`
    })

    title.innerText = titleInput.value
    title.addEventListener('click', () => {
        title.style.display = 'none'
        titleInput.style.display = ''
        titleInput.select()
        setTimeout(() => {
            updatingTitle = true
        }, 100)
    })

    updateTitle = function () {
        if (titleInput.value.trim() === '') titleInput.value = title.innerText
        title.innerText = titleInput.value
        title.style.display = ''
        titleInput.style.display = 'none'
        document.title = `${titleInput.value} - BlackBoard`
        updatingTitle = false
        showSyncStat(false)
        fetch('changename', {method: 'POST', body: titleInput.value})
        setTimeout(() => {
            showSyncStat(true)
        }, 500)
    }

    titleInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") updateTitle()
    })

    window.addEventListener('mousedown', function (e) {
        if (!titleInput.contains(e.target) && updatingTitle) updateTitle()
    })


    const textFields = document.querySelectorAll('.mdc-text-field')
    for (const textField of textFields) {
        mdc.textField.MDCTextField.attachTo(textField)
    }
    const ripples = document.querySelectorAll('.ripple')
    for (const ripple of ripples) {
        mdc.ripple.MDCRipple.attachTo(ripple)
    }
    shareDialog = new mdc.dialog.MDCDialog(document.getElementById('share-dialog'))
    infoDialog = new mdc.dialog.MDCDialog(document.getElementById('info-dialog'))
    resetDialog = new mdc.dialog.MDCDialog(document.getElementById('reset-dialog'))
    snackbar = new mdc.snackbar.MDCSnackbar(document.getElementById('snackbar'))

    document.title = `${titleInput.value} - BlackBoard`

    selectThick(0)
    selectPen(0)
    selectColor(0)

    menu = new mdc.menu.MDCMenu(document.querySelector('.mdc-menu'))
    menu.setFixedPosition(true)

    const list = mdc.list.MDCList.attachTo(document.querySelector('.mdc-list'))
    list.wrapFocus = true
    drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'))
    let his
    try {
        his = JSON.parse(localStorage.getItem("his"))
    } catch (e) {
        his = []
    }
    if (!his) his = []
    while (his.indexOf(socketId) > -1) his.splice(his.indexOf(socketId), 1)
    his.unshift(socketId)
    localStorage.setItem("his", JSON.stringify(his))
})

let socket = new WebSocket(
    `ws://${window.location.host}/ws/blackboard/${socketId}/`
)

socket.onmessage = (e) => {
    let i = JSON.parse(e.data)
    tselectedThick = selectedThick
    tselectedColor = selectedColor
    tselectedControl = selectedControl
    selectedThick = i.w
    selectedColor = i.c
    selectedControl = i.t
    if (selectedControl === 1) {
        let ctx = getCtx(canvas)
        ctx.filter = getNewColor(colorList[selectedColor])
        draw(ctx, points)
    } else draw(getCtx(canvas), points)
    selectedThick = tselectedThick
    selectedColor = tselectedColor
    selectedControl = tselectedControl
}

socket.onclose = (e) => {
    while (true) {
        try {
            showSnackbar('실시간 공유에 오류가 발생했습니다. 다시 연결하고 있습니다...')
            socket = new WebSocket(
                `ws://${window.location.host}/ws/blackboard/${socketId}/`
            )
            break
        } catch (e) {

        }
    }
    showSnackbar('실시간 공유에 다시 연결했습니다.')
}