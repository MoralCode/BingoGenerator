const gameTypeElement = document.getElementById("gametype")
const boardCountElement = document.getElementById("boardcount")
const boardXElement = document.getElementById("boarddimx")
const boardYElement = document.getElementById("boarddimy")
const boardFreeTilesElement = document.getElementById("freetiles")
const generateButtonElement = document.getElementById("generate")
const playBoardElement = document.getElementById("play")
const warningTextElement = document.getElementById("warningText")

/**
 * returns a 2d array representing a randomized arrangement of board tiles.
 * @param {*} rows the number of rows the board should have
 * @param {*} columns the number of columns the board should have
 * @param {*} values the array of values to randomly pull from
 */
function randomizeOptions(rows, columns, values) {

    //duplicate values array so we can mutate it and not mess the real one up
    data = Array.from(values);
    data = shuffle(data);
    board = []

    if (values.length < (rows * columns))
        console.warn("Not enough options to fill a " +rows + "x" + columns + " board without duplicates")
        //maybe fallback to using duplicate items

    for (r = 0; r < rows; r++) {
        row = []
        for (c = 0; c < columns; c++) {
            row[c] = data.shift(); //https://stackoverflow.com/a/29606016
        }
        board[r] = row
    }
    return board
}

/**
 * returns a 2d array representing a randomized arrangement of board tiles with free spaces.
 * @param {*} board the board to apply the free tiles to
 * @param {*} freeTileCount the number of free tiles to add to the board
 */
function insertFreeSpaces(board, freeTileCount) {

    const boardWidth = board[0].length;
    const boardHeight = board.length;
    const totalTiles = boardWidth * boardHeight;

    if (freeTileCount == 0) {
        //user opted for no free tiles, return the board as is
        return board
    }

    if (freeTileCount > totalTiles) {
        console.error("Too many free tiles selected for this board size. Skipping free tile generation")
        return board
    }

    let freeSpacesAdded = 0;

    while (freeSpacesAdded < freeTileCount) {
        const randPosition = Math.floor(Math.random() * (totalTiles + 1));

        const randTileY = Math.floor(randPosition / boardWidth);
        const randTileX = randPosition % boardWidth;

        //if the tile hasnt been made a free space yet, mark it
        if (board[randTileY][randTileX].title != "") {
            board[randTileY][randTileX] = {title: ""}
            freeSpacesAdded++
        }
    }
    return board
}

//Copoed from https://stackoverflow.com/a/2450976 
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

//https://stackoverflow.com/a/42916772
function toDataURL(url) {
    return new Promise(
        (resolve, reject) => {
            if (url == null)  reject()
        var xhr = new XMLHttpRequest();
        xhr.open('get', url);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var fr = new FileReader();

            fr.onload = () => resolve(fr.result);

            fr.readAsDataURL(xhr.response); // async call
        };

        xhr.send();
    });
}

function getTableDefenitionFromBoard(board) {
    //there should be a better way to get the width in pdfmake than
    //just hardcoding the page height and making up an arbitrary number so that it's close enough
    //the 612 comes from the LETTER size in https://github.com/bpampuch/pdfmake/blob/79d9d51e0b5cf5ea4b0491811591ea5aaf15c95b/src/standardPageSizes.js, and the 120 is just a number made up to account for the margins and whatever so that the table appears square when it is used for the height
    const availableWidth = 612.00 - 140;

    //this contains a workaround to center the table.
    //see https://github.com/bpampuch/pdfmake/issues/72
    return {
        columns: [
            { width: '*', text: '' },
            {
                width: 'auto',
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 0,
                    widths: Array(board[0].length).fill('*'),
                    heights: Array(board.length).fill(availableWidth / board.length),
                    alignment: 'center',
                    body: formatBoardText(board)
                }
            },
            { width: '*', text: '' },
        ],
        margin: [0, 60, 0, 0]
    }
}

function formatBoardText(board) {
    formattedText = []

    for (r = 0; r < board.length; r++) {
        row = []
        for (c = 0; c < board[0].length; c++) {
            row[c] = {
                stack: [
                    { text: board[r][c].title, style: 'boardCellMainText' }
                ],
                style: 'boardCell'
            }

            // add the descriptions if present
            if (board[r][c].hasOwnProperty("detail")){
                row[c].stack.push(
                    { text: board[r][c].detail, style: 'boardCellDetailText' }
                )
            }
        }
        formattedText[r] = row
    }

    return formattedText
}

async function getPDFTemplate(quantity, tiles, custom_img) {

    var docDefinition = {
        pageSize: 'LETTER',
        header: [],
        content: [],
        footer: function (currentPage, pageCount) {
            return [
                    {
                        text: [
                            'Board generated by ',
                            { text: 'bingo.adriancedwards.com', link: 'https://bingo.adriancedwards.com/' }
                        ],
                        alignment: 'center'
                    },
                    {
                        text: [
                            'Channel Font used with permission of ',
                            { text: 'Måns Grebäck', link: 'https://www.mansgreback.com/' }
                        ],
                        alignment: 'center'      
                    },
                    { text: 'Page ' + currentPage.toString() + ' of ' + pageCount, alignment: 'center'}
                ]
        },
        pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
            return "columns" in currentNode && previousNodesOnPage.length > 1;
        },
        images: {},
        styles: {
            boardCellMainText: {
                // fontSize: 20,//pt
                bold: true,
                alignment: 'center'
            },
            boardCellDetailText: {
                fontSize: 10,//pt
                italics: true,
                alignment: 'center'
            }
        }
    };

    // var doc = new jsPDF("portrait", "pt", "letter")

    for(i = 0; i < quantity; i++) {
        newboard = createBoard(boardXElement.value, boardYElement.value, tiles, boardFreeTilesElement.value);
        docDefinition.content.push(getTableDefenitionFromBoard(newboard));
    }

    //wait for the image to be added first
    if (custom_img) {
        await toDataURL(custom_img)
            .then((uri) => {
                docDefinition.images.logo = uri

                docDefinition.header.push({
                    image: 'logo',
                    margin: [40, 20, 0, 0],
                    fit: [200, 70]
                })

            })
            .catch((error) => { console.error(error) });
    }
    
    return docDefinition
}

function replaceInlinePDFWith(node) {
    const main = document.getElementsByTagName("main")[0]
    node.id = "pdfinline"
    main.replaceChild(node, document.getElementById('pdfinline'))
}

function createBoard(width, height, options, freespaces) {
    newboard = randomizeOptions(width, height, options);
    newboard = insertFreeSpaces(newboard, freespaces);
    return newboard
}

function storeBoardForPlay(board){
    // Store
    const boardJSON = {
        rows: []
    }
    for (row in board) {
        boardJSON.rows.push({
            cols: board[row]
        })
    }

    sessionStorage.setItem(boardSaveKey, JSON.stringify(boardJSON));
    // console.log(sessionStorage.getItem(boardSaveKey))
}

for (const [key, gamemode] of Object.entries(board_values)) {
    console.log(key);
    console.log(gamemode.hasOwnProperty('name'));
    if (gamemode.hasOwnProperty('name')) {
        option = document.createElement("option")
        option.value = key;
        option.innerText = gamemode.name;
        if (gamemode.default) {
            option.selected = true;
        }
        gameTypeElement.appendChild(option)
    }
}



const checkBoardSize = () => {

    const tilesNeeded = (boardXElement.value * boardYElement.value) - boardFreeTilesElement.value;

    const available_tiles = board_values[gameTypeElement.value].tiles.length;
    console.log(tilesNeeded)
    if (tilesNeeded > available_tiles) {
        // disable the buttons and show a message
        generateButtonElement.hidden = true;
        playBoardElement.hidden = true;
        warningTextElement.innerText = "Your current board settings require more tiles than this game mode has.\n Try checking your board size and free space settings."
        warningTextElement.hidden = false;

    } else {
        generateButtonElement.hidden = false;
        playBoardElement.hidden = false;
        warningTextElement.hidden = true;

    }

}

boardXElement.onchange = checkBoardSize;
boardYElement.onchange = checkBoardSize;
gameTypeElement.onchange = checkBoardSize


generateButtonElement.onclick = () => {

    _paq.push(['trackEvent', 'Boards', 'Generate', board_values[gameTypeElement.value].name, boardCountElement.value]);


    //add loader
    image = document.createElement('img')
    image.src = "assets/media/loader.gif"
    image.style.display = "block";
    image.style.margin = "0 auto";
    replaceInlinePDFWith(image)

    tiles = board_values[gameTypeElement.value].tiles
    custom_img = board_values[gameTypeElement.value].image

    getPDFTemplate(boardCountElement.value, tiles, custom_img)
        .then((template) => pdfMake.createPdf(template).getDataUrl(
            (dataUrl) => {
                var iframe = document.createElement('iframe');
                iframe.src = dataUrl;                
                replaceInlinePDFWith(iframe)
            })
        );
}


playBoardElement.onclick = () => {
    _paq.push(['trackEvent', 'Boards', 'Play', board_values[gameTypeElement.value].name, boardCountElement.value]);

    tiles = board_values[gameTypeElement.value].tiles

    storeBoardForPlay(createBoard(boardXElement.value, boardYElement.value, tiles, boardFreeTilesElement.value))

    let playURL = "/play"
    if (window.location.href.endsWith("/")){
        playURL = "play"
    }
    window.location.href = window.location.href + playURL;

}
