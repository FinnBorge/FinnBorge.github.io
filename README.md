# FinneasB
github Pages


##Finn's Mancala Game: finneasb.github.io

for this game I used JavaScript, JQuery, CSS, and HTML5.

I decided to approach Mancala with the intention of allowing the user to determine how many bowls and pebbles were in play.  

Challenge: procedurally generate the game board

Solution: Use a novel object constructor to create each bowl.  Display position is assigned on creation scaling off the number of bowls requested by the player.

Once I was able to create a game board, I approached implementing the necessary game logic.  The first task was to instruct each bowl to listen for clicks on itself.  This was accomplished with a jQuery .on() method.

Challenege: instruct bowls to listen to clicks on themselves

Solution: I added a prototype method to the bowl constructor to be run in the constructor itself.  The method applies a "click" listener to each bowl upon creation.  

The next challenge was to program the logic applied during every game move.  In Mancala, pebbles are collected from a bowl and then distributed one-by-one into the subsequent bowls, skipping the final bowl on the opposing player's side.  The turn movement is iterated counter-clockwise.  The final pebble placed can trigger special events, such as the capture or an extra turn.

Solution: a series of conditionals forcing the skip of the opposing player's final store as well as testing for the final placement of the turn and applying different logic on that final move.

Additional Functionality: rollback;



##Unresolved problems
No unresolved problems
