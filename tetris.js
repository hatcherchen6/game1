const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// 设置方块大小
const blockSize = 20;
const cols = canvas.width / blockSize;
const rows = canvas.height / blockSize;

// 定义方块形状
const shapes = [
    [[1, 1, 1, 1]],     // I
    [[1, 1], [1, 1]],   // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

// 定义颜色
const colors = [
    '#FF0D72', '#0DC2FF', '#0DFF72',
    '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
];

let board = Array(rows).fill().map(() => Array(cols).fill(0));
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;

// 创建新方块
function createPiece() {
    const shapeIndex = Math.floor(Math.random() * shapes.length);
    currentPiece = {
        shape: shapes[shapeIndex],
        color: colors[shapeIndex],
        x: Math.floor(cols / 2) - 1,
        y: 0
    };
    currentPieceX = currentPiece.x;
    currentPieceY = currentPiece.y;
}

// 绘制方块
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制已固定的方块
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = value;
                context.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
            }
        });
    });
    
    // 绘制当前方块
    if (currentPiece) {
        context.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    context.fillRect(
                        (currentPieceX + x) * blockSize,
                        (currentPieceY + y) * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }
}

// 碰撞检测
function collision() {
    if (!currentPiece) return false;
    
    return currentPiece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (!value) return false;
            const newX = currentPieceX + x;
            const newY = currentPieceY + y;
            return newX < 0 || newX >= cols || newY >= rows ||
                   (newY >= 0 && board[newY][newX]);
        });
    });
}

// 固定方块
function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPieceY + y][currentPieceX + x] = currentPiece.color;
            }
        });
    });
}

// 清除完整的行
function clearLines() {
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
        }
    }
}

// 移动方块
function move(dx, dy) {
    currentPieceX += dx;
    currentPieceY += dy;
    if (collision()) {
        currentPieceX -= dx;
        currentPieceY -= dy;
        if (dy > 0) {
            merge();
            clearLines();
            createPiece();
            if (collision()) {
                // 游戏结束
                board = Array(rows).fill().map(() => Array(cols).fill(0));
            }
        }
    }
}

// 旋转方块
function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[row.length - 1 - i])
    );
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collision()) {
        currentPiece.shape = previousShape;
    }
}

// 键盘控制
document.addEventListener('keydown', event => {
    switch (event.keyCode) {
        case 37: // 左箭头
            move(-1, 0);
            break;
        case 39: // 右箭头
            move(1, 0);
            break;
        case 40: // 下箭头
            move(0, 1);
            break;
        case 38: // 上箭头
            rotate();
            break;
    }
    draw();
});

// 游戏循环
function gameLoop() {
    move(0, 1);
    draw();
    setTimeout(gameLoop, 1000);
}

createPiece();
gameLoop(); 