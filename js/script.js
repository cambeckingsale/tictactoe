const gameBoard = (function () {
  const board = [null, null, null, null, null, null, null, null, null];

  const addPiece = function (piece, index) {
    console.log({ piece, index });
    board[index] = piece;
  };

  const getBoard = function () {
    return board;
  };

  return {
    addPiece,
    getBoard,
  };
})();

const gameController = (function () {
  return {};
})();

const displayController = (function () {
  const dispBoard = document.querySelector('#game-board');
  console.log(dispBoard);
  const updateBoard = function () {
    const currBoard = gameBoard.getBoard();
    currBoard.forEach((piece, index) => {
      dispBoard[index].textContent = piece === null ? '' : piece;
    });
  };

  return {
    updateBoard,
  };
})();

const createPlayer = function (pce) {
  const piece = pce;

  const addPiece = function (index) {
    gameBoard.addPiece(piece, index);
  };
  return {
    addPiece,
  };
};

const playerOne = createPlayer('X');
const playerTwo = createPlayer('Y');
playerOne.addPiece(0);
playerTwo.addPiece(3);
console.log(gameBoard.getBoard());
displayController.updateBoard();
