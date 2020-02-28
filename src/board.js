import React, { Component } from 'react';
import './index.css'
import './App.css';

export default class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {
            faceBomb: '',
            firstClick: true,
            questionMark: '?',
            bombsOnBoard: 0,
            bombsDiscovered: 0,
            bombsDiscoveredVerified: 0,
            idsOfBombs: [],
            Board
        }
    }

    getBoardReady = () => {
        this.createNestedArray(3, 9);
    };

    randomTrueFalse = () => Math.random() <= 0.2;

    createNestedArray = (x, y) => {
        //x is how many arrays
        // y is how many objects in x array

        //ex x = 3, y = 2
        //[
        //[{}, {}], 
        //[{}, {}], 
        //[{}, {}]
        //]
        let countBombs = 0;
        let idsOfBombsHere = [];

        let nestedArray = [];
        for (let i = 0; i < x; i++) {
            nestedArray.push([]);
            for (let j = 0; j < y; j++) {
                //true represents bomb
                let trueFalse = this.randomTrueFalse();
                //keeps track of trues count && the ids 
                if (trueFalse) { countBombs++; idsOfBombsHere.push(`${i}-${j}`); }
                //information of individual cell
                nestedArray[i][j] = {
                    screen: "?",
                    isBomb: trueFalse,
                    hasBeenClicked: false,
                    nearbyBombs: 0,
                    id: `${i}-${j}`,
                    wasrightClicked: false
                };
            }
        }

        for (let i = 0; i < idsOfBombsHere.length; i++) {
            this.incrementNearbyCellBomb(nestedArray, idsOfBombsHere[i])
        }

        this.setState({
            //keeps track of board and some bomb info
            board: nestedArray,
            bombsOnBoard: countBombs,
            idsOfBombs: idsOfBombsHere
        })
    }
    //need to abstracct these
    incrementNearbyCellBomb(board, stringId) {
        let Id = this.stringToId(stringId);

        const x = Id[0];
        const y = Id[1];

        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                //if it dont exist, move on
                if (!board[i] || !board[i][j]) { continue; }
                //dont put the box you clicked on the array of ids that represent the surrounding ids
                else if (i === x && j === y) { continue; }

                board[i][j].nearbyBombs++;
            }
        }
    }

    decrementNearbyCellBomb(board, stringId) {
        let Id = this.stringToId(stringId);

        const x = Id[0];
        const y = Id[1];

        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                //if it dont exist, move on
                if (!board[i] || !board[i][j]) { continue; }
                //dont put the box you clicked on the array of ids that represent the surrounding ids
                else if (i === x && j === y) { continue; }

                board[i][j].nearbyBombs--;
            }
        }
    }

    //for every item in array creates cell
    //[[],creates row from array
    //[{randomObj}], creates cell from randomObj
    //[{}, {}, {}] row with 3 cells
    tablerows = (nestedArray) => {
        if (!this.state.board) { return; }//if a board already exist return
        return nestedArray.map((rows, x) => {
            let row = rows.map((cell, y) => <td id={`${x}-${y}`} onClick={(e) => { this.cellClick(e); }} onContextMenu={(e) => this.handleRightClick(e)}>
                {/*if is hasnt been clicked display a question mark, else deplending on the situation display some kind of logic */}
                {this.state.board[x][y].screen}
                {`${this.state.board[x][y].isBomb}`}
            </td>);
            return (
                <tr>
                    {row}
                </tr>
            );
        });
    }

    stringToId(string) {
        //given 'x-y' will return ['x', 'y']
        let theId = string.split('-');
        //x && y will be turned into numbers, returns array
        let ID = theId.map(stringNumber => parseInt(stringNumber));
        return ID;
    }

    cellClick = (e) => {

        let ID = this.stringToId(e.target.id)
        let cellClicked = this.state.board[ID[0]][ID[1]];

        if (cellClicked.hasBeenClicked) { return; }
        //if you die on first click, fix that
        if (cellClicked.isBomb && this.state.firstClick) {
            //the reason for passing e.target.id instead of ID is beacuse its easier to check if array has 
            //a string than a array
            this.fixFirstClickBomb(e.target.id);
        }

        let newBoard = this.state.board;

        newBoard[ID[0]][ID[1]].hasBeenClicked = true;


        //disgusting!!!!, refactor
       this.changeCellScreen(newBoard, e.target.id);

        this.setState({
            board: newBoard,
            firstClick: false
        });
    }

    changeCellScreen(currentBoard, id) {
        let ID = this.stringToId(id)

        //if its a bomb show bomb
        if (currentBoard[ID[0]][ID[1]].isBomb) { currentBoard[ID[0]][ID[1]].screen = "*" }
        //if its not a bomb and no nearby bombs dont display anything
        else if (!currentBoard[ID[0]][ID[1]].isBomb && currentBoard[ID[0]][ID[1]].nearbyBombs === 0) { currentBoard[ID[0]][ID[1]].screen = "" }
        //else display nearby bomb number
        else { currentBoard[ID[0]][ID[1]].screen = `${currentBoard[ID[0]][ID[1]].nearbyBombs}` }

    }

    showNearbyCellBombScreen(board, stringId) {
        let Id = this.stringToId(stringId);

        const x = Id[0];
        const y = Id[1];

        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                //if it dont exist, move on
                if (!board[i] || !board[i][j]) { continue; }
                //dont put the box you clicked on the array of ids that represent the surrounding ids
                //else if (i === x && j === y) { continue; }

                this.changeCellScreen(board, `${i}-${j}`)
            }
        }
    }


    removeItem(arr, removeThis) {
        return arr.filter(item => item !== removeThis)
    }

    fixFirstClickBomb(cellID) {
        console.log(cellID);

        let newBoard = this.state.board;

        //this.decrementNearbyCellBomb(newBoard, cellID)

        //make all nearby cells false

        let theNewNewBoard = this.showNearbyCellBombScreen(newBoard, cellID);


        this.setState({
            board: theNewNewBoard
        })
        //needs to remove id from idsOfBomb
        //

        //decrement all sourding ids count
        //let newArr = this.removeItem(this.state.idsOfBombs, cellID)

        //randomly create new id
        //add it to newArr

        //make sure it isnt already on idsOfBomb

        /*this.setState({
            idsOfBombs: newArr
        })*/
        //decrement all sourding ids count
        //
        //increment all sourdning ids bombs count
    };

    handleRightClick(e) {
        //stops menu that pops up when right clicked it
        e.preventDefault();

        let ID = this.stringToId(e.target.id);

        let newBoard = this.state.board;
        let cellClicked = newBoard[ID[0]][ID[1]];

        if (cellClicked.hasBeenClicked) { return; }
        //so you can mark and unmark cell
        cellClicked.wasrightClicked = !cellClicked.wasrightClicked;

        if (cellClicked.wasrightClicked) {
            cellClicked.screen = "M";
            //keeps track of bombs marked
            this.setState(prevState => { return { bombsDiscovered: prevState.bombsDiscovered + 1 } });
            //if you marked a cell that really was a bomb, increment counter
            if (cellClicked.isBomb) {
                this.setState(prevState => { return { bombsDiscoveredVerified: prevState.bombsDiscoveredVerified + 1 } });
            }
        } else {
            cellClicked.screen = '?';
            //keeps track of bombs marked
            this.setState(prevState => {
                return {
                    bombsDiscovered: prevState.bombsDiscovered - 1
                }
            })
            if (cellClicked.isBomb) {
                this.setState(prevState => { return { bombsDiscoveredVerified: prevState.bombsDiscoveredVerified - 1 } })
            }
        }

        console.log('fuck')
        this.setState({
            board: newBoard
        })
        this.checkWin();
    }

    checkWin() {
        if (this.state.bombsOnBoard === this.state.bombsDiscoveredVerified) {
            alert('youve kinda won')
        }
    }

    render() {
        return (
            <div>
                <div>Bombs on Board {this.state.bombsOnBoard}</div>
                <div>Bombs Ive Discovered {this.state.bombsDiscovered}</div>
                <div>Verified Bombs marked {this.state.bombsDiscoveredVerified}</div>
                <button onClick={() => { this.getBoardReady(); }}></button>
                <table><tbody>{this.tablerows(this.state.board)}</tbody></table>
            </div>
        )
    }
}
