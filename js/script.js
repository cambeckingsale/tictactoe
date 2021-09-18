/* eslint-env browser */

/* TO DO:
         - na da
*/

const gameBoard = (function () {
  // GAMEBOARD MODULE
  // maintains the game state,
  //     - board : 1D array of the board, moving from left to right, top to bottom.

  let board = [null, null, null, null, null, null, null, null, null];

  const resetBoard = function () {
    // resets the board state to null and all increment counters
    // returns nothing.
    board = [null, null, null, null, null, null, null, null, null];
  };

  const addPiece = function (val, index) {
    // updates the board array with the piece to be placed
    // returns true if valid move, false otherwise
    if (board[index] === null) {
      board[index] = val;
      return true;
    }
    return false;
  };

  const removePiece = function (index) {
    // removes the piece from the board
    board[index] = null;
  };

  const getBoard = function () {
    // returns the current board
    return board;
  };

  return {
    resetBoard,
    addPiece,
    removePiece,
    getBoard,
  };
})();

const createPlayer = function (v, is) {
  // PLAYER FACTORY
  // everything a single player needs.
  //       - val: the score val for that player, +1 and -1...
  //       - imgSrc: the img location for that player
  //       - playtype: if its human, easy or hard.

  const val = v;
  const imgsrc = is;
  let playType = 'human';
  const interval = 200;
  let timer = null;

  const getImgSrc = function () {
    // returns a string representing the path to the players img
    return imgsrc;
  };

  const addPiece = function (index) {
    // adds a piece to the board
    // returns true if successful, false otherwise
    return gameBoard.addPiece(val, index);
  };

  const humanPlayFunc = function () {
    // do nothing and wait for human play to be made
  };

  const getRandomChoice = function () {
    // make a random pick of the remaning board
    // returns the id of the place choosen
    const options = gameController.getAvailableChoices();
    return options[Math.floor(Math.random() * options.length)];
  };

  const easyPlayFunc = function () {
    // adds a piece to the board by random choice of avaialable places.
    // waits 0.75 second before adding to the board.
    // returns nothing.

    // randomly flip through choices and highlight the,
    const options = gameController.getAvailableChoices();
    const optionsLen = options.length;
    shuffleArray(options);
    displayController.highlightChoices(options, interval);

    const choice = getRandomChoice();
    timer = setTimeout(() => {
      // get the next pieceID,
      const pieceID = displayController.getNextChild();
      gameController.addPiece(pieceID, choice);
    }, optionsLen * interval);
  };

  const minimax = function (depth, isMax) {
    const score = gameController.evalBoard();

    if (score !== 0) {
      // score is +10 or -10 if win, 0 if no win
      // end state, so someone has won
      return score;
    }
    if (gameController.isDraw()) {
      // if we have a draw end state then score is neutral
      return 0;
    }
    let maxScore = null;
    const options = gameController.getAvailableChoices();
    if (isMax) {
      // we are trying to maximise as computers go
      maxScore = -1000;

      for (let i = 0; i < options.length; i++) {
        const choice = options[i];
        // add our piece to the board, minmax recursively, then remove our piece
        gameBoard.addPiece(val, choice);
        maxScore = Math.max(maxScore, minimax(depth + 1, !isMax));
        gameBoard.removePiece(choice);
      }
    }
    // eslint-disable-next-line no-else-return
    else {
      // opponent is trying to minimise our score
      maxScore = +1000;
      for (let i = 0; i < options.length; i++) {
        const choice = options[i];
        // add their piece to the board, minmax recursively, then remove our piece
        // other player, so the val is *-1
        gameBoard.addPiece(val * -1, choice);
        maxScore = Math.min(maxScore, minimax(depth + 1, !isMax));
        gameBoard.removePiece(choice);
      }
    }
    return maxScore;
  };

  const getBestChoice = function () {
    let maxScore = -1000;
    let bestOptions = [];
    const options = gameController.getAvailableChoices();

    for (let i = 0; i < options.length; i++) {
      // start the minimax off.
      const choice = options[i];
      gameBoard.addPiece(val, choice);
      const choiceScore = minimax(0, false);
      gameBoard.removePiece(choice);

      if (choiceScore >= maxScore) {
        // is its best choice so far...
        if (choiceScore > maxScore) {
          bestOptions = [choice];
          maxScore = choiceScore;
        } else {
          bestOptions.push(choice);
        }
      }
    }
    return bestOptions[Math.floor(Math.random() * bestOptions.length)];
  };

  const hardPlayFunc = function () {
    // adds a piece to the board by minimax, takes 0.75 second to place
    // returns nothing.
    // flips through the

    // randomly flip through choices and highlight the,
    const options = gameController.getAvailableChoices();
    const optionsLen = options.length;
    shuffleArray(options);
    displayController.highlightChoices(options, interval);

    const choice = getBestChoice();
    timer = setTimeout(() => {
      // get the next pieceID,
      const pieceID = displayController.getNextChild();
      gameController.addPiece(pieceID, choice);
    }, optionsLen * interval);
  };

  const changePlayerType = function (type) {
    // change the player type between human, easy and hard
    // returns nothing
    playType = type;
  };

  const playFunc = function () {
    // selects the current play function when the player is called to make a move.
    // returns nothing.
    switch (playType) {
      case 'human':
        humanPlayFunc();
        break;
      case 'easy':
        easyPlayFunc();
        break;
      case 'hard':
        hardPlayFunc();
        break;
      default:
        break;
    }
  };

  const shuffleArray = function (array) {
    // uses the Fisher Yates shuffle
    // https://stackoverflow.com/a/12646864
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const clearTimer = function () {
    clearTimeout(timer);
  };

  return {
    addPiece,
    getImgSrc,
    changePlayerType,
    playFunc,
    clearTimer,
  };
};

const gameController = (function () {
  // GAMECONTROLLER MODULE
  // controls the flow of the game
  //     - players: the two players of the game
  //     - currPlayer: 0 or 1, the active player whos turn it is.
  let players = [];
  let currPlayer = 0;

  const setUpPlayers = function () {
    // create the players
    // each one has a value thats used to score and a imgsrc
    // returns nothing
    const playerOne = createPlayer(1, 'assets/imgs/tictac.svg');
    const playerTwo = createPlayer(-1, 'assets/imgs/toe.svg');
    players = [playerOne, playerTwo];
  };

  const nextTurn = function () {
    // changes the currplayer to the other player
    // returns nothing
    currPlayer = currPlayer ? 0 : 1;
  };

  const currPlayerPlay = function () {
    // asks the current player to play
    // returns nothing
    players[currPlayer].playFunc();
  };

  const getCurrPlayerImg = function () {
    // returns the current players imgsrc
    return players[currPlayer].getImgSrc();
  };

  const isDraw = function () {
    // checks to see if the board is in a draw state
    // returns true if it is
    // returns false if it does not
    if (gameController.getAvailableChoices().length === 0) {
      return true;
    }
    return false;
  };

  const evalBoard = function () {
    // evaluates function of the board
    // returns 10 if current player wins, -10 if not
    // returns 0 if not win state
    const row = [0, 0, 0];
    const col = [0, 0, 0];
    const diag = [0, 0];
    const board = gameBoard.getBoard();
    for (let i = 0; i < 9; i++) {
      row[Math.floor(i / 3)] += board[i];
      col[i % 3] += board[i];
      if (i % 2 === 0) {
        if (i % 4 === 0) {
          // 0, 4, 8
          diag[0] += board[i];
          if (i === 4) {
            diag[1] += board[i];
          }
        } else {
          // 2, 4, 6
          diag[1] += board[i];
        }
      }
    }
    const scores = [...row, ...col, ...diag];
    for (let i = 0; i < scores.length; i++) {
      if (Math.abs(scores[i]) >= 3) {
        // if one of the rows, columns or diags have a score of 3, then we have a winner
        return Math.sign(scores[i]) * -10;
      }
    }
    return 0;
  };

  const checkWin = function () {
    // checks to see if win, and if there is, then displays it
    // returns true if win, false otherwise
    if (evalBoard() !== 0) {
      displayController.displayWin('win');
      return true;
    }
    if (isDraw()) {
      // there are 8 rows, cols and diags in total, so if each one is full, then all of them are full
      displayController.displayWin('draw');
      return true;
    }
    return false;
  };

  const addPiece = function (pieceID, placeID) {
    // adds the piece to the board, then updates the display and calls all other necessary functions to initiate
    // the next go
    // returns nothing
    if (pieceID.slice(2, 3) === String(currPlayer)) {
      if (players[currPlayer].addPiece(placeID)) {
        displayController.addPiece(pieceID, placeID);
        const winState = checkWin();
        nextTurn();
        displayController.currPlayerGlow();
        if (!winState) {
          currPlayerPlay();
        }
      }
    }
  };

  const resetBoard = function () {
    // resets the board and the display
    // on reset, the currPlayer does not change, this allows for alternating of player that goes first.
    // returns nothing
    gameBoard.resetBoard();
    displayController.resetBoard();
    players[currPlayer].clearTimer();
    displayController.clearTimer();
    currPlayerPlay();
  };

  const changePlayerType = function (type) {
    // on a playerType changing, the board is reset.
    // returns nothing
    players[1].changePlayerType(type);
    resetBoard();
  };

  const isSpaceFree = function (spaceID) {
    // returns true if the space is free, false otherwise
    return gameBoard.getBoard()[spaceID] === null;
  };

  const getAvailableChoices = function () {
    // returns available positions in the board
    const board = gameBoard.getBoard();
    const choices = board.reduce((a, e, i) => {
      if (e === null) {
        // if the spot is empty, then add its index to the accumulator array,
        // as it is an available spot. the index == id
        a.push(i);
      }
      return a;
    }, []);
    return choices;
  };

  return {
    setUpPlayers,
    addPiece,
    resetBoard,
    changePlayerType,
    currPlayerPlay,
    checkWin,
    getCurrPlayerImg,
    isSpaceFree,
    evalBoard,
    isDraw,
    getAvailableChoices,
  };
})();

const displayController = (function () {
  // DISPLAY CONTROLLER MODULE
  // controlls every aspect of the DOM.
  // adding and removing items to/from the DOM,
  // taking actions on button clicks / drag and drops

  const gameSpaces = document.querySelectorAll('.game-space');
  const playerPieces = document.querySelectorAll('.player-piece');
  const gameContainer = document.querySelector('.game-container');
  const ppb0 = document.querySelector(`#ppb0`);
  const ppb1 = document.querySelector(`#ppb1`);
  const gameResult = document.createElement('div');
  const gameResultText = document.createElement('div');
  const gameResultImg = document.createElement('img');
  const resetButton = document.querySelector('.reset-button');
  const humanButton = document.querySelector('#human');
  const easyButton = document.querySelector('#easy');
  const hardButton = document.querySelector('#hard');
  const pps1 = document.querySelector('#pps1');

  let timer = null;

  // create the gameresult element, but do not place this in the DOM unless win state reached.
  gameResult.classList.add('game-result');
  gameResult.appendChild(gameResultText);

  const resetBoard = function () {
    // on hit of the reset button, resets the board

    // place all pieces back in their play area
    const playerPiecesArr = [...playerPieces];
    playerPiecesArr.forEach((piece) => {
      const { player } = piece.dataset;
      const playerPieces = document.querySelector(`#pps${player}`);
      piece.setAttribute('draggable', 'true');
      playerPieces.appendChild(piece);
    });

    // remove the game result page, game can be reset at any time so this doesnt always exist.
    if (gameContainer.contains(gameResult)) {
      gameContainer.removeChild(gameResult);
      // remove the image, only exists if it is a win.
      if (gameResult.contains(gameResultImg)) {
        gameResult.removeChild(gameResultImg);
      }
    }
  };

  const changePlayerType = function (e) {
    // on hit of one of the player two buttons, we need to un-highlight them then highlight the one selected
    // then we need to change player twos player type
    humanButton.classList.remove('playertwo-selected');
    easyButton.classList.remove('playertwo-selected');
    hardButton.classList.remove('playertwo-selected');
    e.target.classList.add('playertwo-selected');

    gameController.changePlayerType(e.target.id);
  };

  const onDrop = function (e) {
    // if a piece is droped onto a place, then try make the move
    e.preventDefault();
    e.target.classList.remove('highlight-space');
    const pieceID = e.dataTransfer.getData('text');
    const spaceID = e.target.id;
    gameController.addPiece(pieceID, spaceID);
  };

  const addPiece = function (pieceID, spaceID) {
    // if a succesful move has been made, then display the piece in the place
    const piece = document.getElementById(pieceID);
    const space = document.getElementById(spaceID);
    piece.setAttribute('draggable', 'false');
    space.appendChild(piece);
  };

  const setUpPlayArea = function () {
    // adds event listeners to the play arena for setUp

    // allow a piece to be dropped into the board, we dont want any action if
    const gameSpacesArr = [...gameSpaces];
    gameSpacesArr.forEach((space) => {
      space.addEventListener('dragover', (e) => {
        // highlight the space if it is dragged over and is free
        e.preventDefault();
        if (gameController.isSpaceFree(e.target.id)) {
          addHighlight(e.target.id);
        }
      });
      space.addEventListener('dragleave', (e) => {
        // remove highlight when not dragged over
        e.preventDefault();
        removeHighlight(e.target.id);
      });
      space.addEventListener('drop', onDrop);
    });

    // allow a piece to be dragged
    const playerPiecesArr = [...playerPieces];
    playerPiecesArr.forEach((piece) => {
      piece.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', e.target.id);
      });
    });

    // setup reset button
    resetButton.addEventListener('click', gameController.resetBoard);

    // setup human button
    humanButton.addEventListener('click', changePlayerType);

    // setup easy button
    easyButton.addEventListener('click', changePlayerType);

    // setup hard button
    hardButton.addEventListener('click', changePlayerType);
  };

  const getNextChild = function () {
    // returns the next piece for player two to be played. for use with computer players
    const childNode = pps1.firstElementChild;
    return childNode.id;
  };

  const displayWin = function (state) {
    // if the game is over then we need to say winner or draw
    const imgsrc = gameController.getCurrPlayerImg();
    switch (state) {
      case 'win':
        gameResultText.textContent = 'WINNER!';
        gameResultImg.setAttribute('src', imgsrc);
        gameResult.appendChild(gameResultImg);
        break;
      case 'draw':
        gameResultText.textContent = 'DRAW!';
        break;
      default:
        break;
    }

    // make sure we cant drag pieces and continue playing under the win text...
    const playerPiecesArr = [...playerPieces];
    playerPiecesArr.forEach((piece) => {
      piece.setAttribute('draggable', 'false');
    });

    gameContainer.appendChild(gameResult);
  };

  const currPlayerGlow = function () {
    // draw a box around the player whos go it is now
    ppb0.classList.toggle('player-pieces-glow');
    ppb1.classList.toggle('player-pieces-glow');
  };

  const addHighlight = function (id) {
    // highlight a space by id
    document.getElementById(id).classList.add('highlight-space');
  };

  const removeHighlight = function (id) {
    // remove highlight from space by id
    document.getElementById(id).classList.remove('highlight-space');
  };

  const highlightChoices = function (choices, interval) {
    // go through the provided array of choices, and highlight them and then unhighlight them at the provided interval
    // returns nothing
    let curr = null;
    timer = setInterval(() => {
      if (curr !== null) {
        removeHighlight(curr);
      }
      curr = choices.pop();
      addHighlight(curr);
      if (choices.length === 0) {
        removeHighlight(curr);
        clearInterval(timer);
      }
    }, interval);
  };

  const clearTimer = function () {
    // if the reset button is hit, we need to stop our interval and unhighlight our spaces
    const gameSpaces = [...document.querySelectorAll('.game-space')];
    gameSpaces.forEach((space) => {
      removeHighlight(space.id);
    });
    clearInterval(timer);
  };

  return {
    resetBoard,
    setUpPlayArea,
    addPiece,
    displayWin,
    currPlayerGlow,
    getNextChild,
    highlightChoices,
    clearTimer,
  };
})();

// SETUP THE GAME ON LOAD
window.addEventListener('load', () => {
  gameController.setUpPlayers();
  displayController.setUpPlayArea();
});
