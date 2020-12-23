
//because boardgen is loaded on every page, the boardSaveKey variable is already available


// check for a board in local storage
//if so load it and allow it to be played, if not, go to generate page

let board = sessionStorage.getItem(boardSaveKey)
const tableElement = document.getElementById("boardTable")

// console.log(board)
if (!board){
	alert("You need to generate a board in order to play it.")
	window.location.href = urlPrefix + "/";
}

board = JSON.parse(board)
console.log(board)
function JSONBoardToNestedArray(board) {
	const arr = []
	for (row of board.rows) {
		arr.push(row.cols)
	}
	return arr
}

board = JSONBoardToNestedArray(board)
console.log(board)

function boardToHTMLTable(board) {
	const rows = []
	for (row of board) {
		const newRow = document.createElement("tr")
		for (col of row) {
			const newCol = document.createElement("td")
			newCol.appendChild(createText("main", col.title))
			newCol.onclick = onTableCellClick
			if ( col.detail ) {
				newCol.appendChild(createText("detail", col.detail))
			}
			newRow.appendChild(newCol)
		}
		rows.push(newRow)
	}
	return rows
}


function createText(style, contents) {
	const text = document.createElement(style == "detail"? "p":"span")
	text.innerText = contents
	text.classList.add(style)
	return text
}

function onTableCellClick(event) {

	console.log(event.target)
	console.log(event.target.style.backgroundColor)

	let box = event.target
	console.log( box)
	while( box && box.tagName != "TD"){
		box = box.parentElement
	}
	console.log(box)
	toggleBackgroundColor(box)
}

function toggleBackgroundColor(cell) {
	const isFilled = cell.style.filter != ""
	if (!isFilled) {
		// cell.style.backgroundColor = "black"
		cell.style.filter = "invert(100%)";

	} else {
		cell.style.backgroundColor = ""
		cell.style.filter = "";
	}

}

const tableRows = boardToHTMLTable(board)

for (row of tableRows){
	tableElement.appendChild(row)
}

