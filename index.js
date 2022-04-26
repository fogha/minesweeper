// Populate tiles
// left click on tiles
// right click on tiles
// check for win or loss

const tile_status = {
  HIDDEN: "hidden",
  MINE: "mine",
  NUMBER: "number",
  MARKED: "marked"
}
const board_size = 5;
const number_of_mines = 10;
const board = createBoard(board_size, number_of_mines);
const boardElement = document.querySelector(".board");
const minesLeft = document.querySelector("[mine-count]");
const messageText = document.querySelector(".subtext")

board.forEach(row => {
  row.forEach(tile => {
    boardElement.append(tile.element);
    tile.element.addEventListener("click", () => {
      revealTile(board, tile)
      checkGameEnd()
     });
    tile.element.addEventListener("contextmenu", e => {
      e.preventDefault();
      markTile(tile);
      listMinesLeft()
    });
  })
})
boardElement.style.setProperty("--size", board_size);
minesLeft.textContent = number_of_mines;

function listMinesLeft() {
  const markedTiles = board.reduce((count, row) => {
    return count + row.filter(tile => tile.status === tile_status.MARKED).length
  }, 0);

  minesLeft.textContent = number_of_mines - markedTiles;
}


function revealTile(board, tile) {
  if (tile.status !== tile_status.HIDDEN) {
    return
  }

  if (tile.mine) {
    tile.status = tile_status.MINE
    return
  }

  tile.status = tile_status.NUMBER
  const adjacentTiles = nearbyTiles(board, tile)
  const mines = adjacentTiles.filter(t => t.mine)
  if (mines.length === 0) {
    adjacentTiles.forEach(revealTile.bind(null, board))
  } else {
    tile.element.textContent = mines.length
  }
}

function checkWin(board) {
  return board.every(row => {
    return row.every(tile => {
      return (
        tile.status === tile_status.NUMBER ||
        (tile.mine &&
          (tile.status === tile_status.HIDDEN ||
            tile.status === tile_status.MARKED))
      )
    })
  })
}

function checkLose(board) {
  return board.some(row => {
    return row.some(tile => {
      return tile.status === tile_status.MINE
    })
  })
}

function markTile(tile) {
  if (tile.status !== tile_status.HIDDEN && tile.status !== tile_status.MARKED) {
    return
  }
  if (tile.status === tile_status.MARKED) {
    tile.status = tile_status.HIDDEN;
  } else {
    tile.status = tile_status.MARKED;
  }
}

function createBoard(boardSize, numberOfMines) {
  const board = [];
  const minePositions = getMines(boardSize, numberOfMines)
  console.log(minePositions);

  for (let x = 0; x < boardSize; x++) {
    const row = [];
    for (let y = 0; y < boardSize; y++) {
      const element = document.createElement('div');
      element.dataset.status = tile_status.HIDDEN;

      const tile = {
        element,
        x,
        y,
        mine: minePositions.some(p => positionMatch(p, {x, y})),
        get status() {
          return this.element.dataset.status
        },
        set status(value) {
          this.element.dataset.status = value;
        }
      }

      row.push(tile);
    }

    board.push(row)
  }

  return board;
}

function getMines(boardSize, numberOfMines) {
  const positions = [];

  while (positions.length < numberOfMines) {
    const position = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize)
    }

    if (!positions.some(p => positionMatch(p, position))) {
      positions.push(position)
    }
  }

  return positions
}

function nearbyTiles(board, { x, y }) {
  const tiles = []

  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      const tile = board[x + xOffset]?.[y + yOffset]
      if (tile) tiles.push(tile)
    }
  }

  return tiles
}

function checkGameEnd() {
  const win = checkWin(board)
  const lose = checkLose(board)

  if (win || lose) {
    boardElement.addEventListener("click", stopProp, { capture: true })
    boardElement.addEventListener("contextmenu", stopProp, { capture: true })
  }

  if (win) {
    messageText.textContent = "You Win"
  }
  if (lose) {
    messageText.textContent = "You Lose"
    board.forEach(row => {
      row.forEach(tile => {
        if (tile.status === tile_status.MARKED) markTile(tile)
        if (tile.mine) revealTile(board, tile)
      })
    })
  }
}

function stopProp(e) {
  e.stopImmediatePropagation()
}

function positionMatch(a, b) {
  return a.x === b.x && a.y === b.y;
}

function randomNumber(size) {
  return Math.floor(Math.random() * size);
}