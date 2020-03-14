/////////////////////////////////////////
// Constants
//////////////////////////////////////////
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROWS_WIDTH = 20;
const ROW_HEIGHT = 20;
const CANVAS_ROWS = CANVAS_WIDTH / ROWS_WIDTH;
const CANVAS_COLUMNS = CANVAS_HEIGHT / ROW_HEIGHT;
const START_LENGTH = 3;
const FPS = 60;
const HEADERGAP = 60;
const MAX_HEAD_FRAME = 6;

const IMGHEAD = new Image();
IMGHEAD.src = "img/headLarger.png";
const IMGTITLE = new Image();
IMGTITLE.src = "img/snek-title.png";

/////////////////////////////////////////
// Enums
/////////////////////////////////////////
OBJENUM = {
    BOARD: 0,
    PLAYER: 1,
    GRABABLE: 2,
    WALL: 3,
    PLAYERHEAD: 4
};

DIRECTIONENUM = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

GAMESCREEN = {
    START: 0,
    NORMAL: 1,
    GAMEOVER: 2
};

COLOURS = {
    startBackground: "#000000",
    startText: "#ffffff",
    mainText: "#ffffff",
    mainBackground: "#B2B1B2",
    playerBody: "#56CBD1",
    grabable: "#cc2222"
};

//////////////////////////////////////////
// Variables
//////////////////////////////////////////
var c; //canvas context
var board = new Array();
var playObj = new Array();
var grabable = new Array();

var movementSpeed;
var headAnimationFrame = 0;

var score = 0;
var scoreIncrement = 100;
var movementCounter = 0;

var stupidTransparency;

var currentDirection;
var nextDirection;
document.onkeydown = checkKey;

var currentScreen = GAMESCREEN.START;
var showFPS = false;

//////////////////////////////////////////
// Functions
//////////////////////////////////////////
var fps = {
    startTime: 0,
    frameNumber: 0,
    getFPS: function()
    {
        this.frameNumber++;
        var d = new Date().getTime(),
            currentTime = (d - this.startTime) / 1000,
            result = Math.floor((this.frameNumber / currentTime));

        if (currentTime > 1)
        {
            this.startTime = new Date().getTime();
            this.frameNumber = 0;
        }
        return result;
    }
};

function checkKey(e)
{
    e = e || window.event;

    switch (currentScreen)
    {
        case GAMESCREEN.START:
            resetGame();
            currentScreen = GAMESCREEN.NORMAL;
            break;
        case GAMESCREEN.NORMAL:
            switch (e.keyCode)
            {
                case 37: // left arrow
                    if (currentDirection != DIRECTIONENUM.RIGHT)
                    {
                        nextDirection = DIRECTIONENUM.LEFT;
                    }
                    break;
                case 38: // up arrow
                    if (currentDirection != DIRECTIONENUM.DOWN)
                    {
                        nextDirection = DIRECTIONENUM.UP;
                    }
                    break;
                case 39: // right arrow
                    if (currentDirection != DIRECTIONENUM.LEFT)
                    {
                        nextDirection = DIRECTIONENUM.RIGHT;
                    }
                    break;
                case 40: // down arrow
                    if (currentDirection != DIRECTIONENUM.UP)
                    {
                        nextDirection = DIRECTIONENUM.DOWN;
                    }
                    break;
                default:
                    //do nothing
            }
            break;
        case GAMESCREEN.GAMEOVER:
            if (e.keyCode == "32")
            {
                resetGame();
                currentScreen = GAMESCREEN.NORMAL;
            }
            break;
    }
}

function detectCollision()
{
    switch (currentDirection)
    {
        case DIRECTIONENUM.UP:
            if ((playObj[0].posY - 1) < 0)
            {
                return 3;
            }
            else
            {
                return board[playObj[0].posX][playObj[0].posY - 1].state;
            }
            break;
        case DIRECTIONENUM.DOWN:
            if ((playObj[0].posY + 1) > (CANVAS_COLUMNS - 1))
            {
                return 3;
            }
            else
            {
                return board[playObj[0].posX][playObj[0].posY + 1].state;
            }
            break;
        case DIRECTIONENUM.LEFT:
            if ((playObj[0].posX - 1) < 0)
            {
                return 3;
            }
            else
            {
                return hit = board[playObj[0].posX - 1][playObj[0].posY].state;
            }
            break;
        case DIRECTIONENUM.RIGHT:
            if ((playObj[0].posX + 1) > (CANVAS_ROWS - 1))
            {
                return 3;
            }
            else
            {
                return board[playObj[0].posX + 1][playObj[0].posY].state;
            }
            break;
    }
    return false;
}

function resetGame()
{
    while (board.length > 0)
    {
        board.pop();
    }

    while (playObj.length > 0)
    {
        playObj.pop();
    }

    while (grabable.length > 0)
    {
        grabable.pop();
    }

    init();

    stupidTransparency = true;
}

function updateScore()
{
    score += scoreIncrement;
}

function updateSpeed()
{
    movementSpeed++;
}

function newGrabable(x, y)
{
    for (var i = 0; i < grabable.length; i++)
    {
        if (x == grabable[i].posX && y == grabable[i].posY)
        {
            var ranGrabableX = getRandomNumber(0, CANVAS_ROWS - 2);
            var ranGrabableY = getRandomNumber(0, CANVAS_COLUMNS - 2);

            while (board[ranGrabableX][ranGrabableY].state == OBJENUM.PLAYER)
            {
                ranGrabableX = getRandomNumber(0, CANVAS_ROWS - 2);
                ranGrabableY = getRandomNumber(0, CANVAS_COLUMNS - 2);
            }

            grabable[i].posX = ranGrabableX;
            grabable[i].posY = ranGrabableY;
        }
    }
}

function updateLength(x, y)
{
    let playObjSquare = new Square(x, y, ROWS_WIDTH, ROW_HEIGHT);
    playObjSquare.state = OBJENUM.PLAYER;
    playObj.unshift(playObjSquare);
}

function init()
{
    for (var i = 0; i < CANVAS_ROWS; i++)
    {
        tempRow = new Array();
        for (var j = 0; j < CANVAS_COLUMNS; j++)
        {
            let tempSquare = new Square(i * ROWS_WIDTH, j * ROW_HEIGHT + HEADERGAP, ROWS_WIDTH, ROW_HEIGHT);
            tempRow.push(tempSquare);
        }
        board.push(tempRow);
    }

    currentDirection = DIRECTIONENUM.RIGHT;
    nextDirection = currentDirection;

    var startPosX = 2;
    var startPosY = 10;
    for (var i = START_LENGTH + startPosX; i > 0; i--)
    {
        let playObjSquare = new Square(i, startPosY, ROWS_WIDTH, ROW_HEIGHT);
        playObjSquare.state = OBJENUM.PLAYER;
        playObj.push(playObjSquare);
    }

    for (var i = 0; i < 5; i++)
    {
        let grabableTemp = new Square(getRandomNumber(0, CANVAS_ROWS - 2), getRandomNumber(0, CANVAS_COLUMNS - 2), ROWS_WIDTH, ROW_HEIGHT);
        grabableTemp.state = OBJENUM.GRABABLE;

        var grabableX = getRandomNumber(0, CANVAS_ROWS - 2);
        var grabableY = getRandomNumber(0, CANVAS_COLUMNS - 2);

        grabable.push(grabableTemp);
    }

    movementSpeed = 10;
    score = 0;
}

function run()
{
    setInterval(function()
    {

        switch (currentScreen)
        {
            case GAMESCREEN.START:
                drawStart();
                break;
            case GAMESCREEN.NORMAL:
                if (movementCounter > (FPS / movementSpeed))
                {
                    update();
                    movementCounter = 0;
                }
                else
                {
                    movementCounter++;
                }
                drawMain();
                break;
            case GAMESCREEN.GAMEOVER:
                drawGameOver();
                break;
        }
    }, 1000 / FPS);
}

function update()
{
    if (currentDirection != nextDirection)
    {
        currentDirection = nextDirection;
    }

    //move
    for (var i = (playObj.length - 1); i > 0; i--)
    {
        playObj[i].posX = playObj[i - 1].posX;
        playObj[i].posY = playObj[i - 1].posY;
    }

    headAnimationFrame++;
    if (headAnimationFrame >= MAX_HEAD_FRAME)
    {
        headAnimationFrame = 0;
    }

    switch (currentDirection)
    {
        case DIRECTIONENUM.LEFT: // left arrow
            if (currentDirection != DIRECTIONENUM.RIGHT)
            {
                currentDirection = DIRECTIONENUM.LEFT;
                switch (detectCollision())
                {
                    case 0:
                        if (playObj[0].posX > 0)
                        {
                            for (var i = (playObj.length - 1); i > 0; i--)
                            {
                                playObj[i].posX = playObj[i - 1].posX;
                                playObj[i].posY = playObj[i - 1].posY;
                            }
                            playObj[0].moveLeft();
                        }
                        break;
                    case 1:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                    case 2:
                        updateScore();
                        updateSpeed();
                        newGrabable(playObj[0].posX - 1, playObj[0].posY);
                        updateLength(playObj[0].posX - 1, playObj[0].posY);
                        break;
                    case 3:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                }
            }
            break;
        case DIRECTIONENUM.UP: // up arrow
            if (currentDirection != DIRECTIONENUM.DOWN)
            {
                currentDirection = DIRECTIONENUM.UP;
                switch (detectCollision())
                {
                    case 0:
                        if (playObj[0].posY > 0)
                        {
                            for (var i = (playObj.length - 1); i > 0; i--)
                            {
                                playObj[i].posX = playObj[i - 1].posX;
                                playObj[i].posY = playObj[i - 1].posY;
                            }
                            playObj[0].moveUp();
                        }
                        break;
                    case 1:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                    case 2:
                        updateScore();
                        updateSpeed();
                        newGrabable(playObj[0].posX, playObj[0].posY - 1);
                        updateLength(playObj[0].posX, playObj[0].posY - 1);
                        break;
                    case 3:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                }
            }
            break;
        case DIRECTIONENUM.RIGHT: // right arrow
            if (currentDirection != DIRECTIONENUM.LEFT)
            {
                currentDirection = DIRECTIONENUM.RIGHT;
                switch (detectCollision())
                {
                    case 0:
                        if (playObj[0].posX <= (CANVAS_ROWS - 2))
                        {
                            for (var i = (playObj.length - 1); i > 0; i--)
                            {
                                playObj[i].posX = playObj[i - 1].posX;
                                playObj[i].posY = playObj[i - 1].posY;
                            }
                            playObj[0].moveRight();
                        }
                        break;
                    case 1:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                    case 2:
                        updateScore();
                        updateSpeed();
                        newGrabable(playObj[0].posX + 1, playObj[0].posY);
                        updateLength(playObj[0].posX + 1, playObj[0].posY);
                        break;
                    case 3:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                }
            }
            break;
        case DIRECTIONENUM.DOWN: // down arrow
            if (currentDirection != DIRECTIONENUM.UP)
            {
                currentDirection = DIRECTIONENUM.DOWN;
                switch (detectCollision())
                {
                    case 0:
                        if (playObj[0].posY <= (CANVAS_COLUMNS - 2))
                        {
                            for (var i = (playObj.length - 1); i > 0; i--)
                            {
                                playObj[i].posX = playObj[i - 1].posX;
                                playObj[i].posY = playObj[i - 1].posY;
                            }
                            playObj[0].moveDown();
                        }
                        break;
                    case 1:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                    case 2:
                        updateScore();
                        updateSpeed();
                        newGrabable(playObj[0].posX, playObj[0].posY + 1);
                        playObj.length - 1
                        updateLength(playObj[0].posX, playObj[0].posY + 1);
                        break;
                    case 3:
                        currentScreen = GAMESCREEN.GAMEOVER;
                        break;
                }
            }
            break;
        default:
            //do nothing
    }

    //clear board
    for (var i = 0; i < CANVAS_ROWS; i++)
    {
        for (var j = 0; j < CANVAS_COLUMNS; j++)
        {
            board[i][j].state = OBJENUM.BOARD;
        }
    }

    //pass player to board
    for (var i = 0; i < playObj.length; i++)
    {
        board[playObj[i].posX][playObj[i].posY].state = playObj[i].state;
    }

    //pass grabable to the board
    for (var i = 0; i < grabable.length; i++)
    {
        board[grabable[i].posX][grabable[i].posY].state = grabable[i].state;
    }
}

function drawStart()
{
    c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    c.fillStyle = COLOURS.startBackground;
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    c.font = "bold 24px sans-serif";
    c.fillStyle = COLOURS.startText;
    c.fillText("Press any key start", (CANVAS_WIDTH / 2) + 70, (CANVAS_HEIGHT / 2) + 60);

    var lines = ["\u2191",
        "Move up",
        "\u2193",
        "Move down",
        "\u2190",
        "Move left",
        "\u2192",
        "Move right"
    ];

    var xPadding = 32;
    var yPadding = 12;
    c.font = "bold 18px sans-serif";
    var xStart = (CANVAS_WIDTH / 2) + 156;
    var yStart = (CANVAS_HEIGHT / 2) + 90;
    for (var i = 0; i < lines.length; i += 2)
    {
        c.fillText(lines[i], xStart, yStart + (i * yPadding));
        c.fillText(lines[i + 1], xStart + xPadding, yStart + (i * yPadding));
    }

    c.drawImage(IMGTITLE, (CANVAS_WIDTH / 2) - (IMGTITLE.width / 2), 80);
}

function drawGameOver()
{
    if (stupidTransparency)
    {
        c.globalAlpha = 0.5;
        c.fillStyle = 'rgb(0,0,0)';
        c.fillRect((CANVAS_WIDTH / 2) - 200, (CANVAS_HEIGHT / 2) - 150, 400, 300);
        c.globalAlpha = 1;

        stupidTransparency = false;

        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.fillStyle = 'rgba(225,225,225,1)';

        c.font = "bold 48px sans-serif";
        c.fillText("Game Over", CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) - 60);
        c.font = "bold 24px sans-serif";
        c.fillText("Score: " + score, CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2));
        c.fillText("Press the spacebar to try again", CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) + 50);
        c.font = "normal 16px sans-serif";
    }
}

function drawMain()
{
    c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawSquares();

    //var textWidth = c.measureText(text).width - c.measureText("0").width;

    c.font = "bold 24px sans-serif";
    c.textBaseline = 'middle';
    c.textAlign = 'right';
    c.fillStyle = COLOURS.mainText;
    c.fillText("Score: " + score, CANVAS_WIDTH - 10, 30);
    if (showFPS)
    {
        c.fillText("FPS: " + fps.getFPS(), CANVAS_WIDTH - 10, 60);
    }
}

function drawSquares()
{
    for (var i = 0; i < CANVAS_ROWS; i++)
    {
        for (var j = 0; j < CANVAS_COLUMNS; j++)
        {
            switch (board[i][j].state)
            {
                case OBJENUM.PLAYER:
                    if (i == playObj[0].posX && j == playObj[0].posY)
                    {
                        c.fillStyle = COLOURS.mainBackground;
                        c.fillRect(board[i][j].posX, board[i][j].posY, board[i][j].width, board[i][j].height);

                        var frameWidth = 20;
                        switch (currentDirection)
                        {
                            case DIRECTIONENUM.UP:
                                c.drawImage(IMGHEAD, headAnimationFrame * frameWidth, 0 * frameWidth, frameWidth, frameWidth, board[i][j].posX, board[i][j].posY, frameWidth, frameWidth);
                                break;
                            case DIRECTIONENUM.RIGHT:
                                c.drawImage(IMGHEAD, headAnimationFrame * frameWidth, 1 * frameWidth, frameWidth, frameWidth, board[i][j].posX, board[i][j].posY, frameWidth, frameWidth);
                                break;
                            case DIRECTIONENUM.DOWN:
                                c.drawImage(IMGHEAD, headAnimationFrame * frameWidth, 2 * frameWidth, frameWidth, frameWidth, board[i][j].posX, board[i][j].posY, frameWidth, frameWidth);
                                break;
                            case DIRECTIONENUM.LEFT:
                                c.drawImage(IMGHEAD, headAnimationFrame * frameWidth, 3 * frameWidth, frameWidth, frameWidth, board[i][j].posX, board[i][j].posY, frameWidth, frameWidth);
                                break;
                        }
                    }
                    else if (i == playObj[playObj.length - 1].posX && j == playObj[playObj.length - 1].posY)
                    {
                        c.fillStyle = "#8FDDE0";
                        c.fillRect(board[i][j].posX, board[i][j].posY, board[i][j].width, board[i][j].height);
                    }
                    else
                    {
                        c.fillStyle = COLOURS.playerBody;
                        c.fillRect(board[i][j].posX, board[i][j].posY, board[i][j].width, board[i][j].height);
                    }
                    break;
                case OBJENUM.GRABABLE:
                    c.fillStyle = COLOURS.grabable;
                    c.fillRect(board[i][j].posX, board[i][j].posY, board[i][j].width, board[i][j].height);
                    break;
                default:
                    c.fillStyle = COLOURS.mainBackground;
                    c.fillRect(board[i][j].posX, board[i][j].posY, board[i][j].width, board[i][j].height);
            }
        }
    }
}

function drawText(text, x, y, colour)
{
    c.font = "bold 24px sans-serif";
    c.textBaseline = 'middle';
    c.textAlign = 'center';
    c.fillStyle = colour;
    c.fillText(text, x, y);
}

function getRandomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function resizeCanvas()
{
    var canvas = document.getElementById("mainCanvas");
    var height = window.innerHeight;
    var ratio = canvas.width / canvas.height;
    var width = height * ratio;

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

/////////////////////////////////////////
// Class
/////////////////////////////////////////
class Square
{
    constructor(x, y, w, h)
    {
        this._posX = x;
        this._posY = y;
        this._width = w;
        this._height = h;
        this._state = OBJENUM.BOARD;
    }

    get posX()
    {
        return this._posX;
    }
    get posY()
    {
        return this._posY;
    }
    get width()
    {
        return this._width;
    }
    get height()
    {
        return this._height;
    }
    get state()
    {
        return this._state;
    }

    set posX(x)
    {
        this._posX = x;
    }
    set posY(y)
    {
        this._posY = y;
    }
    set state(s)
    {
        this._state = s;
    }

    moveUp()
    {
        if (this._posY > 0)
        {
            this._posY--;
        }
    }

    moveDown()
    {
        if (this._posY <= (CANVAS_COLUMNS - 2))
        {
            this._posY++;
        }
    }

    moveLeft()
    {
        if (this._posX > 0)
        {
            this._posX--;
        }
    }

    moveRight()
    {
        if (this._posX <= (CANVAS_ROWS - 2))
        {
            this._posX++;
        }
    }
}

/////////////////////////////////////////
// Onload
/////////////////////////////////////////
window.onload = function()
{
    document.getElementById("game").innerHTML = ("<canvas width='" + CANVAS_WIDTH + "' height='" + (CANVAS_HEIGHT + (HEADERGAP * 2)) + "' id='mainCanvas'></canvas>");
    try
    {
        c = mainCanvas.getContext("2d");
    }
    catch (err)
    {
        alert("This browser is not supported. Please throw your computer out the window!")
    }

    init();
    run();
}
window.addEventListener('load', resizeCanvas, false);
window.addEventListener('resize', resizeCanvas, false);