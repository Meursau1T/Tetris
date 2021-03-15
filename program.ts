const step: number = 19
const gridXLimit: number = 10
const gridYLimit: number = 20
const canvasX: number = 210
const canvasY: number = 410
const canvasBase: number = 5
const canvasRectSize: number = 20
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')

enum Input {
    Up,
    Down,
    Left,
    Right,
    Space,
    Null
}
enum Status {
    Null,
    Active,
    Inactive
}
enum Exitcode {
    Success,
    Out,
    ExistBlock
}

let speed: number = 600
let type: number = 1
let templatePosistion: number[][] = getTemplatePosistion(type);
let grid: Status[][] = new Array(gridYLimit).fill(Status.Null).map(() => new Array(gridXLimit).fill(Status.Null))

function getCanvasPosistion(gridPos: number[]): number[] {
    let x = gridPos[1] * canvasRectSize + canvasBase
    let y = gridPos[0] * canvasRectSize + canvasBase
    return [x, y]
}

function showBlocks(posistion: number[][]): void {
    posistion.forEach((x) => {
        let canvasPos = getCanvasPosistion(x)
        ctx.fillRect(canvasPos[0],canvasPos[1],canvasRectSize,canvasRectSize)
    })
}
function show(): void {
    // draw background 
    ctx.clearRect(0, 0, canvasX, canvasY)
    ctx.fillStyle = "grey"
    ctx.fillRect(0, 0, canvasX, canvasY)
    ctx.clearRect(canvasBase, canvasBase, canvasX - 2 * canvasBase, canvasY - 2 * canvasBase)
    // draw active block
    ctx.fillStyle = "red"
    let activePos = getGridPosistion(Status.Active)
    showBlocks(activePos)
    // draw inactive block 
    ctx.fillStyle = "grey"
    let inactivePos = getGridPosistion(Status.Inactive)
    showBlocks(inactivePos)
}

function parseInput(input: string): Input {
    switch (input) {
        case "ArrowUp":
            return Input.Up
        case "ArrowDown":
            return Input.Down
        case "ArrowLeft":
            return Input.Left
        case "ArrowRight":
            return Input.Right
        case " ":
            return Input.Space
        default:
            return Input.Null
    }
}

function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomType(): number {
    return randomNumber(1, 8)
}

function refreshTemplatePosistion(): void {
    type = randomType()
    templatePosistion = getTemplatePosistion(type)
}

function getTemplatePosistion(type: number): number[][] {
    if (type == 1) {   // Square
        return [[0, 0], [0, 1], [1, 0], [1, 1]]  // left,top
    } else if (type == 2) {  // 2
        return [[0, 0], [0, 1], [1, 1], [1, 2]]
    } else if (type == 3) {  // reverse-2
        return [[0, 1], [0, 2], [1, 0], [1, 1]]
    } else if (type == 4) {  // 7
        return [[0, 0], [0, 1], [1, 1], [2, 1]]
    } else if (type == 5) {  // reverse-7
        return [[0, 1], [0, 2], [1, 1], [2, 1]]
    } else if (type == 6) {   // 1
        return [[0, 1], [1, 1], [2, 1], [3, 1]]
    } else if (type == 7) {    // reverse-1
        return [[1, 0], [1, 1], [1, 2], [1, 3]]
    } else {
        return [[0, 1], [1, 0], [1, 1], [1, 2]]
    }
}

function getGridPosistion(status: Status = Status.Active): number[][] {
    let res: number[][] = []
    for (let i = 0; i < gridYLimit; i++) {
        for (let j = 0; j < gridXLimit; j++) {
            if (grid[i][j] == status) {
                res.push([i, j])
            }
        }
    }
    return res
}

function getPairMin(pairs: number[][], index: number): number {
    let min = Infinity
    pairs.forEach(x => {
        if (x[index] < min) {
            min = x[index]
        }
    })
    return min
}

function getLeft(posistion: number[][]): number {
    return getPairMin(posistion, 1)
}

function getTop(posistion: number[][]): number {
    return getPairMin(posistion, 0)
}

function reassignGrid(value: Status, pos: number[][]): void {
    pos.forEach((pair) => {
        let i = pair[0]
        let j = pair[1]
        grid[i][j] = value
    })
}

function updateGridPosistion(newPos: number[][], oldPos: number[][]): void {
    reassignGrid(Status.Null, oldPos)
    reassignGrid(Status.Active, newPos)
}

function newShape(): void {
    refreshTemplatePosistion()
    if (isMovementValid([], templatePosistion) == Exitcode.Success) {
        updateGridPosistion(templatePosistion, [])
        show()
    } else {
        location.reload()
    }
}

function turnToInactive(posistion: number[][]): void {
    reassignGrid(Status.Inactive, posistion)
    show()
}

/*
    Cange active into inactive
    Try to clear lines
    Renew active
*/

function clearLine(): void {
    grid = grid.filter((x) => {
        let sum = x.reduce((accumulator, currentValue) => accumulator + currentValue)
        return sum != gridYLimit
    })
    while (grid.length < gridYLimit) {
        grid.unshift(new Array(gridXLimit).fill(0))
    }
    show()
}

/*
    Move 
*/
function movePosistions(originPos: number[][], direction: Input): number[][] {
    let newPos = calculateNewPosistion(originPos, getMovement(direction))
    if (isMovementValid(originPos, newPos) == Exitcode.Success) {
        return newPos
    } else {
        return originPos
    }
}

function isMovementValid(originPos: number[][], newPos: number[][]): Exitcode {
    let res = Exitcode.Success
    reassignGrid(Status.Null, originPos)
    newPos.forEach((pair) => {
        if (pair[0] >= 20 || pair[0] < 0 || pair[1] >= 10 || pair[1] < 0) {
            res = Exitcode.Out
            return
        }
        if (grid[pair[0]][pair[1]] != Status.Null) {
            res = Exitcode.ExistBlock
        }
    })
    reassignGrid(Status.Active, originPos)
    return res
}

function getMovement(direction: Input, path: number = 1): number[] {
    if (direction == Input.Up) {
        return [-path, 0]
    } else if (direction == Input.Left) {
        return [0, -path]
    } else if (direction == Input.Right) {
        return [0, path]
    } else {
        return [path, 0]
    }
}

function calculateNewPosistion(originPos: number[][], movement: number[]): number[][] {
    let newPos = originPos.map((x) => {
        let newX: number = x[0] + movement[0]
        let newY: number = x[1] + movement[1]
        return [newX, newY]
    })
    return newPos
}

function move(direction: Input): void {
    let oldPos = getGridPosistion(Status.Active)
    let newPos = movePosistions(oldPos, direction)
    updateGridPosistion(newPos, oldPos)
    show()
    if (oldPos == newPos && direction == Input.Down) {
        turnToInactive(oldPos)
        clearLine()
        newShape()
    }
}

/*
    Transform
*/
function tryTrans(originPos: number[][], newPos: number[][]): number[][] {
    let tryMoveRes = isMovementValid(originPos, newPos)
    if (tryMoveRes == Exitcode.Success) {
        return newPos
    } else if (tryMoveRes == Exitcode.ExistBlock) {
        return originPos
    } else {
        let tryDir = (() => {
            if (getLeft(originPos) + 2 < 5) {
                return Input.Right
            } else {
                return Input.Left
            }
        })()
        for (let i = 1; i <= 3; i++) {
            let res = calculateNewPosistion(newPos, getMovement(tryDir, 1))
            let code = isMovementValid(originPos, res)
            if (code == Exitcode.Success) {
                return res
            }
        }
        return originPos
    }
}

function transBaseCorrection(oldPosistion: number[][], newPosistion: number[][]): number[][] {
    let deltaLeft = getLeft(oldPosistion) - getLeft(newPosistion)
    let deltaTop = getTop(oldPosistion) - getTop(newPosistion)
    let movement = [deltaTop, deltaLeft]
    return calculateNewPosistion(newPosistion, movement)
}

function transform(): void {
    if (type != 1) {
        templatePosistion =
            [[3 - templatePosistion[0][1], templatePosistion[0][0]],
            [3 - templatePosistion[1][1], templatePosistion[1][0]],
            [3 - templatePosistion[2][1], templatePosistion[2][0]],
            [3 - templatePosistion[3][1], templatePosistion[3][0]]]
    }
    let oldPosistion = getGridPosistion()
    let newPosistion: number[][] = templatePosistion.map((x) => {
        let newX: number = x[0] + getTop(oldPosistion)
        let newY: number = x[1] + getLeft(oldPosistion)
        return [newX, newY]
    })
    newPosistion = tryTrans(oldPosistion, transBaseCorrection(oldPosistion, newPosistion))
    updateGridPosistion(newPosistion, oldPosistion)
    show()
}


/*
    Direct opeartion on page
*/
document.onkeydown = function pressKey(event: KeyboardEvent) {
    let input: Input = parseInput(event.key)
    if (input == Input.Up) {
        transform()
    } else if (input == Input.Space) {
        move(input)
        move(input)
    } else if (input == Input.Null) {
        ;
    } else {
        move(input)
    }
}

function init(): void {
    newShape()
    setInterval("move(1,1)", speed)
}

/*
    旋转的时候，在要接近其他灰色格子时，会出现转不动的情况，在边缘有时候也是
*/
