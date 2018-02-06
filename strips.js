var box = [];
var init_state = [];
var curr_state = [];
var goal_state = [];
var moves = [];

var possible_moves = [];
var operators = [];

function init() {
    var all_possible_moves = [];

    //Debug initial state
    // init_state = [
    //     ['on', 1, 1, 1], ['on', 2, 1, 2], ['on', 3, 1, 3], ['on', 4, 2, 3], ['on', 5, 3, 3], ['on', 6, 3, 2], ['on', 7, 3, 1], ['on', 8, 2, 2],
    //     ['clear', 0, 2, 1]
    // ];

    //Set the box
    box = [
        [1,2,3],
        [7,8,4],
        [6,0,5]
    ];

    //Get the box states
    setInitialState();

    goal_state = [
        ['on', 1, 1, 1], ['on', 2, 1, 2], ['on', 3, 1, 3], ['on', 4, 2, 3], ['on', 5, 3, 3], ['on', 6, 3, 2], ['on', 7, 3, 1], ['on', 8, 2, 1],
        ['clear', 0, 2, 2]
    ];

    curr_state = goal_state.slice();

    //Store all possible moves and it's operators
    for(var x=1; x<9; x++) {
        for(var i=1; i<4; i++) {
            for(var j=1; j<4; j++){
                //Check if x can move up
                if(i-1 > 0)
                    all_possible_moves.push(['move', x, i, j, i-1, j]);

                //Check if x can move down
                if(i+1 < 4)
                    all_possible_moves.push(['move', x, i, j, i+1, j]);

                //Check if x can move left
                if(j-1 > 0)
                    all_possible_moves.push(['move', x, i, j, i, j-1]);

                //Check if x can move right
                if(j+1 < 4)
                    all_possible_moves.push(['move', x, i, j, i, j+1]);
            }
        }
    }

    all_possible_moves.forEach((value, index) => {
        var operator = [
            ['move', value[1], value[2], value[3], value[4], value[5]],
            //Precondition
            [
                ['on', value[1], value[2], value[3]],
                ['clear', 0, value[4], value[5]]
            ],
            //add
            [
                ['on', value[1], value[4], value[5]],
                ['clear', 0, value[2], value[3]]
            ],
            //remove
            [
                ['on', value[1], value[2], value[3]],
                ['clear', 0, value[4], value[5]]
            ]
        ];

        operators.push(operator);
    });

    possible_moves = getAllPossibleMoves();
}

function setInitialState () {

    init_state = [];

    for(var i=0; i<3; i++) {
        for(var j=0; j<3; j++) {
            if(box[i][j] != 0){
                init_state.push(['on', box[i][j], i+1, j+1]);
            }else {
                init_state.push(['clear', 0, i+1, j+1]);
            }
        }
    }
}

function updateStateOperators (move) {

    // console.log(move);

    //Get all operators corresponding to the move, and remove them from the current state
    curr_state.forEach((operator, index) => {
        if(operator[2] == move[2] && operator[3] == move[3]) {
            curr_state.splice(index, 1);
        }
    });

    curr_state.forEach((operator, index) => {
        if(operator[2] == move[4] && operator[3] == move[5]) {
            curr_state.splice(index, 1);
        }
    });

    //Add the new preconditions of the move to the current state bank
    operators.forEach((value, index) => {
        if(value[0][1] == move[1] && value[0][2] == move[2] && value[0][3] == move[3] && value[0][4] == move[4] && value[0][5] == move[5]) {
            curr_state = curr_state.concat(value[1]);
        }
    });
}

function getClearPos () {

    var box = [];

    curr_state.forEach((value, index) => {
        if(value[0] == 'clear') {
            box = [value[2], value[3]];
        }
    });

    return box;
}

function getNumber (boxY, boxX) {

    var box = 0;

    curr_state.forEach((value, index) => {
        if(value[0] == 'on' && value[3] == boxX && value[2] == boxY) {
            box = value[1];
        }
    });

    return box;
}

function getAllPossibleMoves() {

    var clear = getClearPos();
    var moves = [];

    //Check up move
    if(clear[0]-1 > 0) {
        var num = getNumber(clear[0]-1, clear[1]);
        moves.push(['move', num, clear[0], clear[1], clear[0] - 1, clear[1]]);
    }

    //Check for move down
    if(clear[0]+1 < 4) {
        var num = getNumber(clear[0]+1, clear[1]);
        moves.push(['move', num, clear[0], clear[1], clear[0] + 1, clear[1]]);
    }

    //check for move left
    if(clear[1]-1 > 0) {
        var num = getNumber(clear[0], clear[1]-1);
        moves.push(['move', num, clear[0], clear[1], clear[0], clear[1] - 1]);
    }

    //check for move right
    if(clear[1]+1 < 4) {
        var num = getNumber(clear[0], clear[1]+1);
        moves.push(['move', num, clear[0], clear[1], clear[0], clear[1] + 1]);
    }

    return moves;
}

function checkIntersection(x, y) {

    var intersection = [];

    x.forEach((valueX) => {
        y.forEach(valueY => {
            if(valueX[0] == valueY[0] && valueX[1] == valueY[1] && valueX[2] == valueY[2] && valueX[3] == valueY[3]) {
                intersection.push(valueY);
            }
        })
    });

    return intersection;
}

function pickBestMove () {

    //Compare the moves with the best precondition match ups
    var winPts = -1;
    var winner = [];

    possible_moves.forEach((move, index) => {
        var precond = [];

        operators.forEach((value, index) => {
            if(value[0][1] == move[1] && value[0][2] == move[2] && value[0][3] == move[3] && value[0][4] == move[4] && value[0][5] == move[5]){
                precond = precond.concat(value[1]);
            }
        });

        var movePoints = 0;
        movePoints = checkIntersection(precond, init_state).length;

        if(movePoints > winPts) {
            winner = [];
            winner.push(move);
            winPts = movePoints;
        }else if(movePoints == winPts) {
            winner.push(move);
        }
    });

    return winner[Math.floor(Math.random()*winner.length)];
}

function runStrips () {

    //Initialize the game parameters
    init();
    var time = Date.now();
    var counter = 0;

    while(checkIntersection(curr_state, init_state).length < 9) {

        possible_moves = getAllPossibleMoves();

        var choosen = pickBestMove();
        moves.push(choosen);
        updateStateOperators(choosen);
        console.log('Elapsed Time : ' + (Date.now() - time)/100);
        counter++;

        // if(counter > 1)
        //     break;

        // console.log(checkIntersection(curr_state, init_state).length);

        if(((Date.now() - time)/100) > 1000){
            break;
            console.log('Solution Not Found');
        }
    }

    console.log('Initial State : ');
    console.log(init_state);

    console.log('Current State : ');
    console.log(curr_state);

    console.log('Goal State : ');
    console.log(goal_state);

    console.log('Solution Found!');
    console.log(moves.reverse());
}

//Run the strips
runStrips();