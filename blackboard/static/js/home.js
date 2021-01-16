let controls, selectedControl, selectedThick, selectedColor
let controlMargin = [-10, -110, -220]
let colorList = ['#000000', '#f55d49', '#f5b049', '#ede96f', '#85e68a', '#87d9ed', '#4d5ce3', '#b96fed', '#8a8a8a']
let shareDialog, snackbar

let title, titleInput, updatingTitle = false
let drawer

function showSnackbar(str) {
    document.getElementById('snackbar-text').innerText = str
    snackbar.close()
    snackbar.open()
}


document.addEventListener('DOMContentLoaded', () => {
    title = document.getElementById('title')
    titleInput = document.getElementById('title-input')


    const textFields = document.querySelectorAll('.mdc-text-field')
    for (const textField of textFields) {
        mdc.textField.MDCTextField.attachTo(textField)
    }
    const ripples = document.querySelectorAll('.ripple')
    for (const ripple of ripples) {
        mdc.ripple.MDCRipple.attachTo(ripple)
    }
    shareDialog = new mdc.dialog.MDCDialog(document.getElementById('share-dialog'))
    snackbar = new mdc.snackbar.MDCSnackbar(document.getElementById('snackbar'))

    document.getElementById('shareUrl').addEventListener('keydown', e => {
        if (e.key === 'Enter') join()
    })

    let params = (new URL(location)).searchParams
    if (params.get('state') === '404') {
        showSnackbar('블랙보드가 존재하지 않습니다.')
        window.history.replaceState(null, null, location.origin)
    }
    const list = mdc.list.MDCList.attachTo(document.querySelector('.mdc-list'))
    list.wrapFocus = true
    drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'))


    let his
    try {
        his = JSON.parse(localStorage.getItem("his"))
    } catch (e) {
        his = []
    }
    if (his.length > 0) {
        document.getElementById('no-blackboard').style.display = 'none'
        for (let i of his) {
            document.getElementById('recent').innerHTML += `<a href="board/${i}"><div class="card">${i}</div></a>`
        }
    }
})


function join() {
    if (!parseInt(document.getElementById('shareUrl').value)) {
        showSnackbar('코드를 입력해 주세요!')
        return
    }
    location.href = '/board/' + parseInt(document.getElementById('shareUrl').value)
}