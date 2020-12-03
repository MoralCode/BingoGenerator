# BingoGenerator

A Website that generated bingo games on a variety of topics



## Configuration Options

- game type: allows you to pick one of the many predefined board/game topics
- board dimensions
- number of boards to generate at once



## TODO's

- board variability adjustment (to be implemented): limits the size of the list of tiles that each board draws from to adjust the variability of the tiles.

	If this number is equal to the number of tiles in a board (width times height) then all boards will contain the same tiles in a different order. Any number that is greater than double the number of tiles in a board may allow all boards to contain totally separate tiles. (will need to account for free spaces).

	May be better to implement this as a scale from 0 (all boards are the same tiles in a different order) to 100 (all boards draw from the full pool of tiles and could share zero tiles with each other)

- free spaces (both random and/or consistent between generated boards)
- numbers-based bingo mode?
- upload a custom image to the bingo sheet (advanced)
- some way to digitally fill out the bingo cards to avoid printing?
- track the number of boards generated https://matomo.org/docs/custom-dimensions/
- fallacies
https://www.youtube.com/watch?v=9LR6EA91zLo
https://www.youtube.com/watch?v=I52hsUyQeis
