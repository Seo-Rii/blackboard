let tolerance = 1
let invertRange = [0, 1]
let invertStep = 0.1
let sepiaRange = [0, 1]
let sepiaStep = 0.1
let saturateRange = [5, 100]
let saturateStep = 5
let hueRotateRange = [0, 360]
let hueRotateStep = 5
let possibleColors


// matrices taken from https://www.w3.org/TR/filter-effects/#feColorMatrixElement
function sepiaMatrix(s) {
    return [
        (0.393 + 0.607 * (1 - s)), (0.769 - 0.769 * (1 - s)), (0.189 - 0.189 * (1 - s)),
        (0.349 - 0.349 * (1 - s)), (0.686 + 0.314 * (1 - s)), (0.168 - 0.168 * (1 - s)),
        (0.272 - 0.272 * (1 - s)), (0.534 - 0.534 * (1 - s)), (0.131 + 0.869 * (1 - s)),
    ]
}

function saturateMatrix(s) {
    return [
        0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
        0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
        0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
    ]
}

function hueRotateMatrix(d) {
    let cos = Math.cos(d * Math.PI / 180)
    let sin = Math.sin(d * Math.PI / 180)
    let a00 = 0.213 + cos * 0.787 - sin * 0.213
    let a01 = 0.715 - cos * 0.715 - sin * 0.715
    let a02 = 0.072 - cos * 0.072 + sin * 0.928

    let a10 = 0.213 - cos * 0.213 + sin * 0.143
    let a11 = 0.715 + cos * 0.285 + sin * 0.140
    let a12 = 0.072 - cos * 0.072 - sin * 0.283

    let a20 = 0.213 - cos * 0.213 - sin * 0.787
    let a21 = 0.715 - cos * 0.715 + sin * 0.715
    let a22 = 0.072 + cos * 0.928 + sin * 0.072

    return [
        a00, a01, a02,
        a10, a11, a12,
        a20, a21, a22,
    ]
}

function clamp(value) {
    return value > 255 ? 255 : value < 0 ? 0 : value
}

function filter(m, c) {
    return [
        clamp(m[0] * c[0] + m[1] * c[1] + m[2] * c[2]),
        clamp(m[3] * c[0] + m[4] * c[1] + m[5] * c[2]),
        clamp(m[6] * c[0] + m[7] * c[1] + m[8] * c[2]),
    ]
}

function invertBlack(i) {
    return [
        i * 255,
        i * 255,
        i * 255,
    ]
}

function generateColors() {
    let possibleColors = []

    let invert = invertRange[0]
    for (invert; invert <= invertRange[1]; invert += invertStep) {
        let sepia = sepiaRange[0];
        for (sepia; sepia <= sepiaRange[1]; sepia += sepiaStep) {
            let saturate = saturateRange[0]
            for (saturate; saturate <= saturateRange[1]; saturate += saturateStep) {
                let hueRotate = hueRotateRange[0]
                for (hueRotate; hueRotate <= hueRotateRange[1]; hueRotate += hueRotateStep) {
                    let invertColor = invertBlack(invert)
                    let sepiaColor = filter(sepiaMatrix(sepia), invertColor)
                    let saturateColor = filter(saturateMatrix(saturate), sepiaColor)
                    let hueRotateColor = filter(hueRotateMatrix(hueRotate), saturateColor)

                    let colorObject = {
                        filters: {invert, sepia, saturate, hueRotate},
                        color: hueRotateColor
                    }

                    possibleColors.push(colorObject)
                }
            }
        }
    }

    return possibleColors
}

function getFilters(targetColor, localTolerance) {
    possibleColors = possibleColors || generateColors()

    for (let i = 0; i < possibleColors.length; i++) {
        let color = possibleColors[i].color
        if (
            Math.abs(color[0] - targetColor[0]) < localTolerance &&
            Math.abs(color[1] - targetColor[1]) < localTolerance &&
            Math.abs(color[2] - targetColor[2]) < localTolerance
        ) {
            return filters = possibleColors[i].filters
        }
    }

    localTolerance += tolerance
    return getFilters(targetColor, localTolerance)
}

function hexToRgb(hexType) {
    let hex = hexType.replace("#", "")
    let value = hex.match(/[a-f\d]/gi)
    if (value.length === 3) hex = value[0] + value[0] + value[1] + value[1] + value[2] + value[2]
    value = hex.match(/[a-f\d]{2}/gi)
    let r = parseInt(value[0], 16)
    let g = parseInt(value[1], 16)
    let b = parseInt(value[2], 16)
    return [r, g, b]
}

function getNewColor(color) {
    let filters = getFilters(hexToRgb(color), tolerance)
    return 'invert(' + Math.floor(filters.invert * 100) + '%) ' +
        'sepia(' + Math.floor(filters.sepia * 100) + '%) ' +
        'saturate(' + Math.floor(filters.saturate * 100) + '%) ' +
        'hue-rotate(' + Math.floor(filters.hueRotate) + 'deg)'
}