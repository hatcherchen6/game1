const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');

// 游戏状态
let score = 0;
let level = 1;
let lines = 0;
let isPaused = false;

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

// 定义渐变色
const gradients = [
    ['#FF416C', '#FF4B2B'], // 红色渐变
    ['#4776E6', '#8E54E9'], // 蓝紫渐变
    ['#00B4DB', '#0083B0'], // 青色渐变
    ['#FFD200', '#F7971E'], // 黄色渐变
    ['#56ab2f', '#a8e063'], // 绿色渐变
    ['#614385', '#516395'], // 紫色渐变
    ['#eaafc8', '#654ea3']  // 粉紫渐变
];

let board = Array(rows).fill().map(() => Array(cols).fill(0));
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;

// 创建渐变色块
function createGradient(colorPair) {
    const gradient = context.createLinearGradient(0, 0, blockSize, blockSize);
    gradient.addColorStop(0, colorPair[0]);
    gradient.addColorStop(1, colorPair[1]);
    return gradient;
}

// 绘制单个方块
function drawBlock(x, y, gradient) {
    context.save();
    context.translate(x * blockSize, y * blockSize);
    
    // 绘制主体
    context.fillStyle = gradient;
    context.fillRect(1, 1, blockSize - 2, blockSize - 2);
    
    // 绘制高光效果
    context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    context.fillRect(1, 1, blockSize - 2, blockSize/2);
    
    // 绘制边框
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.strokeRect(1, 1, blockSize - 2, blockSize - 2);
    
    context.restore();
}

// 更新分数
function updateScore(clearedLines) {
    const points = [0, 100, 300, 500, 800]; // 0,1,2,3,4行的分数
    score += points[clearedLines];
    lines += clearedLines;
    level = Math.floor(lines / 10) + 1;
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// 绘制游戏界面
function draw() {
    // 绘制背景
    context.fillStyle = '#1e2030';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i = 0; i < rows; i++) {
        for(let j = 0; j < cols; j++) {
            context.strokeRect(j * blockSize, i * blockSize, blockSize, blockSize);
        }
    }
    
    // 绘制已固定的方块
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(x, y, value);
            }
        });
    });
    
    // 绘制当前方块
    if (currentPiece) {
        const gradient = createGradient(currentPiece.gradient);
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(currentPieceX + x, currentPieceY + y, gradient);
                }
            });
        });
    }
}

// 创建新方块
function createPiece() {
    const shapeIndex = Math.floor(Math.random() * shapes.length);
    currentPiece = {
        shape: shapes[shapeIndex],
        gradient: gradients[shapeIndex],
        x: Math.floor(cols / 2) - 1,
        y: 0
    };
    currentPieceX = currentPiece.x;
    currentPieceY = currentPiece.y;
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
                board[currentPieceY + y][currentPieceX + x] = currentPiece.gradient;
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
    if (!isPaused) {
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
    }
    if (event.keyCode === 32) { // 空格键
        isPaused = !isPaused;
    }
    draw();
});

// 游戏循环
function gameLoop() {
    if (!isPaused) {
        move(0, 1);
        draw();
    }
    setTimeout(gameLoop, Math.max(100, 1000 - (level * 100))); // 随等级提高速度
}

createPiece();
gameLoop(); 