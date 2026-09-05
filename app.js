// all possible positions

let positionsMap = {};
let positions = [];
let positionGroups = [];
let handStatuses = [];
for (let turn of ['A', 'B']) {
    for (let AH = 0; AH <=4; AH++) {
        for (let AL = 0; AL <= AH; AL++) {
            if (turn == 'A') {
                let handStatus = `${AH}${AL}`;
                handStatuses.push(handStatus);
            }
            let groupId = `${turn}${AH}${AL}`;
            positionGroups.push(groupId);
            for (let BH = 0; BH <=4; BH++) {
                for (let BL = 0; BL <= BH; BL++) {
                    if (AH==0 && AL==0 && BH==0 && BL==0) {
                        continue; // invalid position
                    }
                    if (AH==0 && AL==0 && turn=='B') {
                        continue; // invalid position, A already lost on A's turn
                    }
                    if (BH==0 && BL==0 && turn=='A') {
                        continue; // invalid position, B already lost on B's turn
                    }
                    let id = `${turn}${AH}${AL}${BH}${BL}`;
                    let position = {
                        id: id,
                        turn: turn,
                        AH: AH,
                        AL: AL,
                        BH: BH,
                        BL: BL,
                        forwardMoves: [],
                        backwardMoves: [],
                        winner: null,
                        outlook: null,
                        movesToWin: null
                    };
                    positions.push(position);
                    positionsMap[id] = position;
                }
            }
        }
    }
}

let canonicalPositionId = function(turn, AH, AL, BH, BL) {
    let tmp = null;
    if (AH < AL) {
        tmp = AH;
        AH = AL;
        AL = tmp;
    }
    if (BH < BL) {
        tmp = BH;
        BH = BL;
        BL = tmp;
    }
    return `${turn}${AH}${AL}${BH}${BL}`;
}

// all possible moves
let moves = [];
for (let p of positions) {
    if (p.turn == 'A') {
        if (p.AH == 0 && p.AL == 0) {
            p.winner = "B";
            p.outlook = "B";
            p.movesToWin = 0;
        } else {
            // TAP MOVES
            if (p.AH > 0) {
                // tap from AH to BH
                let newBH = p.BH + p.AH;
                if (newBH <= 5) {
                    if (newBH == 5) {
                        newBH = 0;
                    }
                    let nextPosId = canonicalPositionId('B', p.AH, p.AL, newBH, p.BL);
                    moves.push({"src": p.id, "dst": nextPosId, "move": "TAHBH", score: 0});
                }
                if (p.BL != p.BH) {
                    // tap from AH to BL
                    let newBL = p.BL + p.AH;
                    if (newBL <= 5) {
                        if (newBL == 5) {
                            newBL = 0;
                        }
                        let nextPosId = canonicalPositionId('B', p.AH, p.AL, p.BH, newBL);
                        moves.push({"src": p.id, "dst": nextPosId, "move": "TAHBL", score: 0});
                    }
                }
            }
            if (p.AL > 0 && p.AL != p.AH) {
                // tap from AL to BH
                let newBH = p.BH + p.AL;
                if (newBH <= 5) {
                    if (newBH == 5) {
                        newBH = 0;
                    }
                    let nextPosId = canonicalPositionId('B', p.AH, p.AL, newBH, p.BL);
                    moves.push({"src": p.id, "dst": nextPosId, "move": "TALBH", score: 0});
                }
                if (p.BL != p.BH) {
                    // tap from AL to BL
                    let newBL = p.BL + p.AL;
                    if (newBL <= 5) {
                        if (newBL == 5) {
                            newBL = 0;
                        }
                        let nextPosId = canonicalPositionId('B', p.AH, p.AL, p.BH, newBL);
                        moves.push({"src": p.id, "dst": nextPosId, "move": "TALBL", score: 0});
                    }
                }
            }
            // Split moves. To prevent duplicate moves, think of these
            // in terms of how the difference between H and L changes.
            // Make H-L-difference smaller by 2. (Shift 1 from H to L.) (Ex: 30 -> 21)
            if (p.AH - p.AL >= 2) {
                let nextPosId = canonicalPositionId('B', p.AH-1, p.AL+1, p.BH, p.BL);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SAH1L", score: 0});
            }
            // Make H-L-difference smaller by 4. (Shift 2 from H to L.) (Ex: 40 -> 22)
            if (p.AH - p.AL >= 4) {
                let nextPosId = canonicalPositionId('B', p.AH-2, p.AL+2, p.BH, p.BL);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SAH2L", score: 0});
            }
            // Make H-L-difference larger by 2. (Shift 1 from L to H.) (Ex. 31 -> 40, 42 -> 51=01)
            if (p.AL >= 1 && p.AH <= 3) { // TODO: or p.AH <= 4, depending on option
                let nextPosId = canonicalPositionId('B', p.AH+1, p.AL-1, p.BH, p.BL);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SAL1H", score: 0});
            }
            // Make H-L-difference larger by 4. (Shift 2 from L to H.) (Ex. 22 -> 40, 33 -> 51=01)
            if (p.AL >= 2 && p.AH <= 2) { // TODO: or p.AH <= 3, depending on option
                let nextPosId = canonicalPositionId('B', p.AH+2, p.AL-2, p.BH, p.BL);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SAL2H", score: 0});
            }
        }
    }
    if (p.turn == 'B') {
        if (p.BH == 0 && p.BL == 0) {
            p.winner = "A";
            p.outlook = "A";
            p.movesToWin = 0;
        } else {
            if (p.BH > 0) {
                // tap from BH to AH
                let newAH = p.AH + p.BH;
                if (newAH <= 5) {
                    if (newAH == 5) {
                        newAH = 0;
                    }
                    let nextPosId = canonicalPositionId('A', newAH, p.AL, p.BH, p.BL);
                    moves.push({"src": p.id, "dst": nextPosId, "move": "TBHAH", score: 0});
                }
                if (p.AL != p.AH) {
                    // tap from BH to AL
                    let newAL = p.AL + p.BH;
                    if (newAL <= 5) {
                        if (newAL == 5) {
                            newAL = 0;
                        }
                        let nextPosId = canonicalPositionId('A', p.AH, newAL, p.BH, p.BL);
                        moves.push({"src": p.id, "dst": nextPosId, "move": "TBHAL", score: 0});
                    }
                }
            }
            if (p.BL > 0 && p.BL != p.BH) {
                // tap from BL to AH
                let newAH = p.AH + p.BL;
                if (newAH <= 5) {
                    if (newAH == 5) {
                        newAH = 0;
                    }
                    let nextPosId = canonicalPositionId('A', newAH, p.AL, p.BH, p.BL);
                    moves.push({"src": p.id, "dst": nextPosId, "move": "TBLAH", score: 0});
                }
                if (p.AL != p.AH) {
                    // tap from BL to AL
                    let newAL = p.AL + p.BL;
                    if (newAL <= 5) {
                        if (newAL == 5) {
                            newAL = 0;
                        }
                        let nextPosId = canonicalPositionId('A', p.AH, newAL, p.BH, p.BL);
                        moves.push({"src": p.id, "dst": nextPosId, "move": "TBLAL", score: 0});
                    }
                }
            }
            // Split moves. To prevent duplicate moves, think of these
            // in terms of how the difference between H and L changes.
            // Make H-L-difference smaller by 2. (Shift 1 from H to L.) (Ex: 30 -> 21)
            if (p.BH - p.BL >= 2) {
                let nextPosId = canonicalPositionId('A', p.AH, p.AL, p.BH-1, p.BL+1);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SBH1L", score: 0});
            }
            // Make H-L-difference smaller by 4. (Shift 2 from H to L.) (Ex: 40 -> 22)
            if (p.BH - p.BL >= 4) {
                let nextPosId = canonicalPositionId('A', p.AH, p.AL, p.BH-2, p.BL+2);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SBH2L", score: 0});
            }
            // Make H-L-difference larger by 2. (Shift 1 from L to H.) (Ex. 31 -> 40, 42 -> 51=01)
            if (p.BL >= 1 && p.BH <= 3) { // TODO: or p.AH <= 4, depending on option
                let nextPosId = canonicalPositionId('A', p.AH, p.AL, p.BH+1, p.BL-1);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SBL1H", score: 0});
            }
            // Make H-L-difference larger by 4. (Shift 2 from L to H.) (Ex. 22 -> 40, 33 -> 51=01)
            if (p.BL >= 2 && p.BH <= 2) { // TODO: or p.AH <= 3, depending on option
                let nextPosId = canonicalPositionId('A', p.AH, p.AL, p.BH+2, p.BL-2);
                moves.push({"src": p.id, "dst": nextPosId, "move": "SBL2H", score: 0});
            }
        }
    }
}

// populate each position with list of possible moves
for (let move of moves) {
    move.id = move.src + "-" + move.dst;
    srcPos = positionsMap[move.src];
    dstPos = positionsMap[move.dst];
    srcPos.forwardMoves.push(move);
    dstPos.backwardMoves.push(move);
}

// mark positions where a player can't move
for (let p of positions) {
    if (!p.winner) {
        if (p.forwardMoves.length == 0) {
            if (p.turn == 'A') {
                p.winner = 'B';
                p.outlook = 'B';
                p.movesToWin = 0;
            }
            if (p.turn == 'B') {
                p.winner = 'A';
                p.outlook = 'A';
                p.movesToWin = 0;
            }
        }
    }
}

let moveToShortString = function(move) {
    return move.src + "->" + move.dst;
}

// return 0 if it was not updated, 1 if it was updated
let updateOutlook = function(position, newValue) {
    let oldValue = position.outlook;
    if (oldValue != newValue) {
        position.outlook = newValue;
        console.log('outlook: ' + oldValue + '->' + newValue + ' for ' + position.id);
        console.log('- ' + JSON.stringify(position));
        return 1;
    } else {
        console.log('outlook already set to ' + newValue + ' for ' + position.id);
        return 0;
    }
}

let updateMovesToWin = function(position, newValue) {
    let oldValue = position.movesToWin;
    if (oldValue != newValue) {
        position.movesToWin = newValue;
        console.log('movesToWin: ' + oldValue + '->' + newValue + ' for ' + position.id);
        console.log('- ' + JSON.stringify(position));
        return 1;
    } else {
        console.log('movesToWin already set to ' + newValue + ' for ' + position.id);
        return 0;
    }
}

let updateScore = function(move, newValue) {
    let oldValue = move.score;
    if (oldValue != newValue) {
        move.score = newValue;
        console.log('score: ' + oldValue + '->' + newValue + ' for ' + moveToShortString(move));
        console.log('- ' + JSON.stringify(move));
        return 1;
    } else {
        console.log('score already set to ' + newValue + ' for ' + moveToShortString(move));
        return 0;
    }
}

let numIterations = 15;
for (let i = 1; i <= numIterations; i++) {
    let numUpdates = 0;
    for (let p of positions) {
        if (p.outlook == 'A') {
            if (p.turn == 'B') {
                // check previous turns for A
                for (let prevMove of p.backwardMoves) {
                    let prevPos = positionsMap[prevMove.src];
                    // A can guarantee win if at this position
                    numUpdates += updateOutlook(prevPos, 'A');
                    //MOVESTOWIN numUpdates += updateMovesToWin(prevPos, p.movesToWin+1);
                    numUpdates += updateScore(prevMove, 100); // A should move here because A can guarantee win
                }
            }
            if (p.turn == 'A') {
                // check previous turns for B
                for (let prevMove of p.backwardMoves) {
                    numUpdates += updateScore(prevMove, -100); // B should not move here because A can guarantee win
                }
            }
        }
        if (p.outlook == 'B') {
            if (p.turn == 'A') {
                // check previous turns for B
                for (let prevMove of p.backwardMoves) {
                    let prevPos = positionsMap[prevMove.src];
                    // B can guarantee win if at this position
                    numUpdates += updateOutlook(prevPos, 'B');
                    //MOVESTOWIN numUpdates += updateMovesToWin(prevPos, p.movesToWin+1);
                    numUpdates += updateScore(prevMove, 100); // B should move here because B can guarantee win
                }
            }
            if (p.turn == 'B') {
                // check previous turns for A
                for (let prevMove of p.backwardMoves) {
                    numUpdates += updateScore(prevMove, -100); // A should not move here because B can guarantee win
                }
            }
        }
        if (p.outlook == null) {
            // check scenarios where every possible move is either a bad move or a good move
            let minScore = 100;
            let maxScore = -100;
            for (let nextMove of p.forwardMoves) {
                if (nextMove.score < minScore) {
                    minScore = nextMove.score;
                }
                if (nextMove.score > maxScore) {
                    maxScore = nextMove.score;
                }
            }
            if (maxScore == -100) {
                console.log("Found position without any good moves! p=" + JSON.stringify(p));
                if (p.turn == 'A') {
                    numUpdates += updateOutlook(p, 'B');
                }
                if (p.turn == 'B') {
                    numUpdates += updateOutlook(p, 'A');
                }
                // calculate minMovesToWin
                //MOVESTOWIN
                /*
                let minMovesToWin = 32000; // any number highest than max unique game positions
                for (let nextMove of p.forwardMoves) {
                    let nextPosId = nextMove.dst;
                    let nextPos = positionsMap[nextPosId];
                    if (nextPos.movesToWin < minMovesToWin) {
                        minMovesToWin = nextPos.movesToWin;
                    }
                }
                p.movesToWin = minMovesToWin + 1;
                if (minMovesToWin == 7777) {
                    console.log("ERROR: did not properly set movesToWin");
                }
                */
            }
        }
    }
    let countWithOutlook = 0;
    let countWithoutOutlook = 0;
    for (let p of positions) {
        if (p.outlook == null) {
            countWithoutOutlook++;
        } else {
            countWithOutlook++;
        }
    }
    console.log("i=" + i + ": numUpdates=" + numUpdates + ", countWithOutlook=" + countWithOutlook + ", countWithoutOutlook=" + countWithoutOutlook);
}

// Print all positions
/*
for (let p of positions) {
    if (p.turn == 'A') {
        if (p.winner != null) {
            console.log(JSON.stringify(p));
            console.log('-');
        }
    }
}
*/

// Print Cheat Sheet
let header = "\t";
for (let BHBL of handStatuses) {
    if (BHBL == '00') {
        continue;
    }
    header = header + "XX" + BHBL + "\t";
}
console.log(header);
for (let AHAL of handStatuses) {
    if (AHAL == '00') {
        continue;
    }
    let s = AHAL + "\t";
    for (let BHBL of handStatuses) {
        if (BHBL == '00') {
            continue;
        }
        let posId = 'A' + AHAL + BHBL;
        let p = positionsMap[posId];
        if (p == null || p.forwardMoves.length == 0) {
            s = s + "-|---" + "\t";
        } else {
            let sortedMoves = p.forwardMoves.map(move => { return {"move": move.move, "dst": move.dst, "score": move.score};}).sort((m1,m2)=>{return m2.score-m1.score});
            let bestMove = sortedMoves[0];
            let bestMoveStr = null;
            if (bestMove.move.startsWith('T')) {
                bestMoveStr = "T" + bestMove.dst.substring(3, 5);
            } else if (bestMove.move.startsWith('S')) {
                bestMoveStr = "S" + bestMove.dst.substring(1, 3);
            } else {
                bestMoveStr = "ERR!";
            }
            let movesToWinStr = ""; // p.movesToWin == null ? "-" : p.movesToWin;
            let outlookStr = (p.outlook == null ? "-" : p.outlook);
            s = s + outlookStr + movesToWinStr + "|" + bestMoveStr + "\t";
            ////s = s + movesToWinStr + "|" + bestMove.move + "\t";
        }
    }
    console.log(s);
}

let outputJson = {
    "positions": positions,
    "moves": moves
};
console.log(JSON.stringify(outputJson, null, 2));

