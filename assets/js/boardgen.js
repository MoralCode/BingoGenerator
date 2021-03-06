const gameTypeElement = document.getElementById("gametype")
const boardCountElement = document.getElementById("boardcount")
const boardXElement = document.getElementById("boarddimx")
const boardYElement = document.getElementById("boarddimy")
const boardFreeTilesElement = document.getElementById("freetiles")
const generateButtonElement = document.getElementById("generate")
const playBoardElement = document.getElementById("play")

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

async function getPDFTemplate(quantity, options) {

    var docDefinition = {
        pageSize: 'LETTER',
        header: [
            {
                image: 'logo',
                margin: [40,20,0,0]
            },
        ],
        content: [],
        footer: function (currentPage, pageCount) {
            return [
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
        newboard = randomizeOptions(boardXElement.value, boardYElement.value, options);
        newboard = insertFreeSpaces(newboard, boardFreeTilesElement.value);
        docDefinition.content.push(getTableDefenitionFromBoard(newboard));
    }

    //wait for the image to be added first
    await toDataURL("assets/media/hallmarkbingo.png")
    .then((uri) => {
        docDefinition.images.logo = uri
        
    })
    .catch((error) => {console.error(error)});

    return docDefinition
}

function replaceInlinePDFWith(node) {
    const main = document.getElementsByTagName("main")[0]
    node.id = "pdfinline"
    main.replaceChild(node, document.getElementById('pdfinline'))
}

function createBoard(width, height, options) {
    newboard = randomizeOptions(width, height, options);
    newboard = insertFreeSpaces(newboard, boardFreeTilesElement.value);
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

for (const gamemode in board_values) {
    console.group(gamemode);
    option = document.createElement("option")
    option.value = gamemode;
    option.innerText = board_values[gamemode].name || gamemode;
    if (board_values[gamemode].default) {
        option.selected = true;
    }
    gameTypeElement.appendChild(option)
}


generateButtonElement.onclick = () => {

    _paq.push(['trackEvent', 'Boards', 'Generate', board_values[gameTypeElement.value].name, boardCountElement.value]);


    //add loader
    image = document.createElement('img')
    image.src = "assets/media/loader.gif"
    image.style.display = "block";
    image.style.margin = "0 auto";
    replaceInlinePDFWith(image)

    tiles = board_values[gameTypeElement.value].tiles

    getPDFTemplate(boardCountElement.value, tiles)
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

    storeBoardForPlay(createBoard(boardXElement.value, boardYElement.value, tiles))

    let playURL = "/play"
    if (window.location.href.endsWith("/")){
        playURL = "play"
    }
    window.location.href = window.location.href + playURL;

}