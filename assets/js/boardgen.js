board_values = {
    cliche: [
        {title: "Truck"},
        {title: "Christmas Event"},
        {title: "Misunderstanding"},
        {title: "Brooks Brothers"},
        {title: "Laser eyes (each other)"},
        {title: "Single Mom"},
        {title: "One parent is dead"},
        {title: "Charity Santa"},
        {title: "Interrupted Moment (almost kiss)"},
        {title: "Decorating"},
        {title: "Laser Eyes (him to her)"},
        {title: "Blonde"},
        {title: "Money Trouble"},
        {title: "Car Crash"},
        {title: "Both parents are dead"},
        {title: "Christmas Baking"},
        {title: "Blue Collar Job"},
        {title: "Owns/Works at Small Independent Shop"},
        {title: "Good with Kids"},
        {title: "Divorced"},
        {title: "Laser Eyes (her to him)"},
        {title: "Tragic Sibling Event"},
        {title: "Reformed Scrooge"},
        {title: "Kissing in Snow"},
        {title: "Class Differences"},
        {title: "Christmas Sweater"},
        {title: "New in Town"},
        {title: "Recycled Advice (“a friend once said..”)"},
        {title: "Illness"},
        {title: "Proposal"},
        {title: "Rugged"},
        {title: "Dog"},
        {title: "Christmas Shopping"},
        {title: "“Moment” by the Christmas Tree"},
        {title: "POC Friend"},
        {title: "Disapproving Parents"},
        {title: "“Oh, It’s Snowing”"},
        {title: "Cat"},
        {title: "Kiss by the Fire"},
        {title: "Single Dad"},
        {title: "Kissing Under Mistletoe"}
    ],
    christmas: [
        {title: ""}
    ]

}

const gameTypeElement = document.getElementById("gametype")
const boardCountElement = document.getElementById("boardcount")
const boardXElement = document.getElementById("boarddimx")
const boardYElement = document.getElementById("boarddimy")
const generateButtonElement = document.getElementById("generate")

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


generateButtonElement.onclick = () => {
    //add loader
    image = document.createElement('img')
    image.src = "assets/media/loader.gif"
    image.style.display = "block";
    image.style.margin = "0 auto";
    replaceInlinePDFWith(image)

    getPDFTemplate(boardCountElement.value, board_values.cliche)
        .then((template) => pdfMake.createPdf(template).getDataUrl(
            (dataUrl) => {
                var iframe = document.createElement('iframe');
                iframe.src = dataUrl;                
                replaceInlinePDFWith(iframe)
            })
        );
}
