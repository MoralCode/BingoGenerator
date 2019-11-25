board_values = {
    cliche: [
        "Truck",
        "Christmas Event",
        "Misunderstanding",
        "Brooks Brothers",
        "Laser eyes(each other)",
        "Single Mom",
        "One parent is dead",
        "Charity Santa",
        "Interrupted Moment(almost kiss)",
        "Decorating",
        "Laser Eyes (him to her)",
        "Blonde",
        "Money Trouble",
        "Car Crash",
        "Both parents are dead",
        "Christmas Baking",
        "Blue Collar Job",
        "Owns/ Works at Small Independent Shop",
        "Good with Kids",
        "Divorced",
        "Laser Eyes (her to him)",
        "Tragic Sibling Event",
        "Reformed Scrooge",
        "Kissing in Snow",
        "Class Differences",
        "Christmas Sweater",
        "New in Town",
        "Recycled Advice(“a friend once said..”)",
        "Illness",
        "Proposal",
        "Rugged",
        "Dog",
        "Christmas Shopping",
        "“Moment” by the Christmas Tree",
        "POC Friend",
        "Disapproving Parents",
        "“Oh, It’s Snowing”",
        "Cat",
        "Kiss by the Fire",
        "Single Dad",
        "Kissing Under Mistletoe"
    ],
    christmas: [
        ""
    ]

}

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


function populateTable(table, board) {
    for (r=0; r < board.length; r++) {
        row = document.createElement("tr");

        for (c = 0; c < board[0].length; c++) {
            value = document.createElement("td");
            value.innerText = board[r][c];
            row.appendChild(value)
        }
        table.appendChild(row);
    }
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



async function getPDF() {

    var docDefinition = {
        content: [
            {
                image: 'logo'
            }
        ],
        images: {

        }
    };

    // var doc = new jsPDF("portrait", "pt", "letter")

    //wait for the image to be added first
    await toDataURL("assets/media/hallmarkbingo.png")
    .then((uri) => {
        docDefinition.images.logo = uri
        
    })
    .catch((error) => {console.error(error)});

    
    pdf = pdfMake.createPdf(docDefinition);

    pdf.open();
}


board = randomizeOptions(5, 5, board_values.cliche);
populateTable(document.getElementById("gameboard"), board);
getPDF()