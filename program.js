var step = 19;
var gridXLimit = 10;
var gridYLimit = 20;
var canvasX = 210;
var canvasY = 410;
var canvasBase = 5;
var canvasRectSize = 20;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var Input;
(function (Input) {
    Input[Input["Up"] = 0] = "Up";
    Input[Input["Down"] = 1] = "Down";
    Input[Input["Left"] = 2] = "Left";
    Input[Input["Right"] = 3] = "Right";
    Input[Input["Space"] = 4] = "Space";
    Input[Input["Null"] = 5] = "Null";
})(Input || (Input = {}));
var Status;
(function (Status) {
    Status[Status["Null"] = 0] = "Null";
    Status[Status["Active"] = 1] = "Active";
    Status[Status["Inactive"] = 2] = "Inactive";
})(Status || (Status = {}));
var Exitcode;
(function (Exitcode) {
    Exitcode[Exitcode["Success"] = 0] = "Success";
    Exitcode[Exitcode["Out"] = 1] = "Out";
    Exitcode[Exitcode["ExistBlock"] = 2] = "ExistBlock";
})(Exitcode || (Exitcode = {}));
var speed = 600;
var type = 1;
var templatePosistion = getTemplatePosistion(type);
var grid = new Array(gridYLimit).fill(Status.Null).map(function () { return new Array(gridXLimit).fill(Status.Null); });
function getCanvasPosistion(gridPos) {
    var x = gridPos[1] * canvasRectSize + canvasBase;
    var y = gridPos[0] * canvasRectSize + canvasBase;
    return [x, y];
}
function showBlocks(posistion) {
    posistion.forEach(function (x) {
        var canvasPos = getCanvasPosistion(x);
        ctx.fillRect(canvasPos[0], canvasPos[1], canvasRectSize, canvasRectSize);
    });
}
function show() {
    // draw background 
    ctx.clearRect(0, 0, canvasX, canvasY);
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, canvasX, canvasY);
    ctx.clearRect(canvasBase, canvasBase, canvasX - 2 * canvasBase, canvasY - 2 * canvasBase);
    // draw active block
    ctx.fillStyle = "red";
    var activePos = getGridPosistion(Status.Active);
    showBlocks(activePos);
    // draw inactive block 
    ctx.fillStyle = "grey";
    var inactivePos = getGridPosistion(Status.Inactive);
    showBlocks(inactivePos);
}
function parseInput(input) {
    switch (input) {
        case "ArrowUp":
            return Input.Up;
        case "ArrowDown":
            return Input.Down;
        case "ArrowLeft":
            return Input.Left;
        case "ArrowRight":
            return Input.Right;
        case " ":
            return Input.Space;
        default:
            return Input.Null;
    }
}
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomType() {
    return randomNumber(1, 8);
}
function refreshTemplatePosistion() {
    type = randomType();
    templatePosistion = getTemplatePosistion(type);
}
function getTemplatePosistion(type) {
    if (type == 1) { // Square
        return [[0, 0], [0, 1], [1, 0], [1, 1]]; // left,top
    }
    else if (type == 2) { // 2
        return [[0, 0], [0, 1], [1, 1], [1, 2]];
    }
    else if (type == 3) { // reverse-2
        return [[0, 1], [0, 2], [1, 0], [1, 1]];
    }
    else if (type == 4) { // 7
        return [[0, 0], [0, 1], [1, 1], [2, 1]];
    }
    else if (type == 5) { // reverse-7
        return [[0, 1], [0, 2], [1, 1], [2, 1]];
    }
    else if (type == 6) { // 1
        return [[0, 1], [1, 1], [2, 1], [3, 1]];
    }
    else if (type == 7) { // reverse-1
        return [[1, 0], [1, 1], [1, 2], [1, 3]];
    }
    else {
        return [[0, 1], [1, 0], [1, 1], [1, 2]];
    }
}
function getGridPosistion(status) {
    if (status === void 0) { status = Status.Active; }
    var res = [];
    for (var i = 0; i < gridYLimit; i++) {
        for (var j = 0; j < gridXLimit; j++) {
            if (grid[i][j] == status) {
                res.push([i, j]);
            }
        }
    }
    return res;
}
function getPairMin(pairs, index) {
    var min = Infinity;
    pairs.forEach(function (x) {
        if (x[index] < min) {
            min = x[index];
        }
    });
    return min;
}
function getLeft(posistion) {
    return getPairMin(posistion, 1);
}
function getTop(posistion) {
    return getPairMin(posistion, 0);
}
function reassignGrid(value, pos) {
    pos.forEach(function (pair) {
        var i = pair[0];
        var j = pair[1];
        grid[i][j] = value;
    });
}
function updateGridPosistion(newPos, oldPos) {
    reassignGrid(Status.Null, oldPos);
    reassignGrid(Status.Active, newPos);
}
function newShape() {
    refreshTemplatePosistion();
    if (isMovementValid([], templatePosistion) == Exitcode.Success) {
        updateGridPosistion(templatePosistion, []);
        show();
    }
    else {
        location.reload();
    }
}
function turnToInactive(posistion) {
    reassignGrid(Status.Inactive, posistion);
    show();
}
/*
    Cange active into inactive
    Try to clear lines
    Renew active
*/
function clearLine() {
    grid = grid.filter(function (x) {
        var sum = x.reduce(function (accumulator, currentValue) { return accumulator + currentValue; });
        return sum != gridYLimit;
    });
    while (grid.length < gridYLimit) {
        grid.unshift(new Array(gridXLimit).fill(0));
    }
    show();
}
/*
    Move
*/
function movePosistions(originPos, direction) {
    var newPos = calculateNewPosistion(originPos, getMovement(direction));
    if (isMovementValid(originPos, newPos) == Exitcode.Success) {
        return newPos;
    }
    else {
        return originPos;
    }
}
function isMovementValid(originPos, newPos) {
    var res = Exitcode.Success;
    reassignGrid(Status.Null, originPos);
    newPos.forEach(function (pair) {
        if (pair[0] >= 20 || pair[0] < 0 || pair[1] >= 10 || pair[1] < 0) {
            res = Exitcode.Out;
            return;
        }
        if (grid[pair[0]][pair[1]] != Status.Null) {
            res = Exitcode.ExistBlock;
        }
    });
    reassignGrid(Status.Active, originPos);
    return res;
}
function getMovement(direction, path) {
    if (path === void 0) { path = 1; }
    if (direction == Input.Up) {
        return [-path, 0];
    }
    else if (direction == Input.Left) {
        return [0, -path];
    }
    else if (direction == Input.Right) {
        return [0, path];
    }
    else {
        return [path, 0];
    }
}
function calculateNewPosistion(originPos, movement) {
    var newPos = originPos.map(function (x) {
        var newX = x[0] + movement[0];
        var newY = x[1] + movement[1];
        return [newX, newY];
    });
    return newPos;
}
function move(direction) {
    var oldPos = getGridPosistion(Status.Active);
    var newPos = movePosistions(oldPos, direction);
    updateGridPosistion(newPos, oldPos);
    show();
    if (oldPos == newPos && direction == Input.Down) {
        turnToInactive(oldPos);
        clearLine();
        newShape();
    }
}
/*
    Transform
*/
function tryTrans(originPos, newPos) {
    var tryMoveRes = isMovementValid(originPos, newPos);
    if (tryMoveRes == Exitcode.Success) {
        return newPos;
    }
    else if (tryMoveRes == Exitcode.ExistBlock) {
        return originPos;
    }
    else {
        var tryDir = (function () {
            if (getLeft(originPos) + 2 < 5) {
                return Input.Right;
            }
            else {
                return Input.Left;
            }
        })();
        for (var i = 1; i <= 3; i++) {
            var res = calculateNewPosistion(newPos, getMovement(tryDir, 1));
            var code = isMovementValid(originPos, res);
            if (code == Exitcode.Success) {
                return res;
            }
        }
        return originPos;
    }
}
function transBaseCorrection(oldPosistion, newPosistion) {
    var deltaLeft = getLeft(oldPosistion) - getLeft(newPosistion);
    var deltaTop = getTop(oldPosistion) - getTop(newPosistion);
    var movement = [deltaTop, deltaLeft];
    return calculateNewPosistion(newPosistion, movement);
}
function transform() {
    if (type != 1) {
        templatePosistion =
            [[3 - templatePosistion[0][1], templatePosistion[0][0]],
                [3 - templatePosistion[1][1], templatePosistion[1][0]],
                [3 - templatePosistion[2][1], templatePosistion[2][0]],
                [3 - templatePosistion[3][1], templatePosistion[3][0]]];
    }
    var oldPosistion = getGridPosistion();
    var newPosistion = templatePosistion.map(function (x) {
        var newX = x[0] + getTop(oldPosistion);
        var newY = x[1] + getLeft(oldPosistion);
        return [newX, newY];
    });
    newPosistion = tryTrans(oldPosistion, transBaseCorrection(oldPosistion, newPosistion));
    updateGridPosistion(newPosistion, oldPosistion);
    show();
}
/*
    Direct opeartion on page
*/
document.onkeydown = function pressKey(event) {
    var input = parseInput(event.key);
    if (input == Input.Up) {
        transform();
    }
    else if (input == Input.Space) {
        move(input);
        move(input);
    }
    else if (input == Input.Null) {
        ;
    }
    else {
        move(input);
    }
};
function init() {
    newShape();
    setInterval("move(1,1)", speed);
}
/*
    旋转的时候，在要接近其他灰色格子时，会出现转不动的情况，在边缘有时候也是
*/
