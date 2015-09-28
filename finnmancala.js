
var battlefield = [];
var inputHowManyBowls = 14;
var howManyPebbles = 4;
var playerTurn = "player2"; //or "player1"
var player1Store = 0; //this is the store object, set later
var player2Store = 0; // ^^
var player1LeftPositions = [];
var player2LeftPositions = [];
var $boo = $("#boo");
var $mario = $("#mario");
var mar = 0;
var boo = 0;
var buffer = [];

//audio
var booLaugh = new Audio('sm64_boo.wav');
var hereWeGo = new Audio('sm64_here_we_go.wav');
var pressStart = new Audio('sm64_mario_press_start.wav');
var thankYou = new Audio('sm64_mario_thank_you.wav');
var booSelf = new Audio('mparty8_boo.wav');
var booCelebrate = new Audio('mparty8_boo_celebrate.wav');
var marioHaha = new Audio('sm64_mario_haha.wav');
var marioHoohoo = new Audio('sm64_mario_hoohoo.wav');
var peachMario = new Audio('sm64_peach_mario_2.wav');
var marioWins = new Audio('mparty8_mario_wins.wav');
var marioCel = new Audio('mparty8_mario_02.wav');
//end audio
var turnCount = 0;

function Bowl (options) {
 this.stoneCount    = 0;
 this.position      = options.position;
 this.player        = options.player;
 this.isStore       = (this.position === (inputHowManyBowls/2)-1 || this.position === inputHowManyBowls-1);
 this.render();
 this.setListener();
 if(this.isStore && this.player === "player1"){
   player1Store = this;
 } else if(this.isStore && this.player === "player2"){
   player2Store = this;
 }
}

Bowl.prototype.render = function () {
  var $battlefield1 = $("#battlefield1");
  var $battlefield2 = $("#battlefield2");
  var bowlClass = this.isStore ? "store" : "bowl";
  this.$el = $("<div>");
  this.$el.addClass(bowlClass);
  this.$el.css(determineCSS(this.position, this.player)); //see determineCSS function
  if(this.position < inputHowManyBowls/2){
  $battlefield1.append(this.$el);
  } else if (inputHowManyBowls/2 <= this.position < inputHowManyBowls) {
  $battlefield2.append(this.$el);
  }
};

Bowl.prototype.setListener = function () {
  var parentObj = this;
  if(!(parentObj.isStore)){
    this.$el.on('click', function(e){
    //this = parentBowl.$el
    if(parentObj.player === playerTurn){
      makeMoves(parentObj);
      updateAll();
      turnCount += 1;
      createBackState();
    } else {
      return;
    }
    gameEndTest();
  });
}
};

var makeMoves = function(parentBowl){
  var stonesToPlace = parentBowl.stoneCount; //placeable pseudo-stones
  parentBowl.stoneCount = 0;
  var consumed = 0; //placed pseudo-stones go here
  var origin = parentBowl.position;
  var nextIndex = origin;
  if(stonesToPlace === 0) {return;}
  while(stonesToPlace > 1){
     stonesToPlace -= 1;
     consumed += 1;
     nextIndex = origin + consumed;//index position of subsequent bowl
     if(nextIndex >= inputHowManyBowls-1){
       nextIndex -= (inputHowManyBowls-1);
     }
     if(isItEnemyStore(nextIndex)){
      consumed += 1;
      nextIndex += 1;
     }
     battlefield[nextIndex].stoneCount += 1;
  }
  if(nextIndex >= inputHowManyBowls-1){
    nextIndex -= (inputHowManyBowls-1);
  }
  finalMove(nextIndex);
};

var finalMove = function(nextIndex){
  //setting final bowl
  var finalIndex = nextIndex + 1;
  if(finalIndex === inputHowManyBowls){finalIndex = 0;}
  var finalBowl = battlefield[finalIndex];
  if(playerTurn === "player1" && isItEnemyStore(finalIndex)){ //player 1's final move takes it to player2s store (skips it);
    finalBowl = battlefield[0];
  } else if (playerTurn === "player2" && isItEnemyStore(finalIndex)){ //player2's final move takes it to player1s store (skips it);
    finalBowl = battlefield[(inputHowManyBowls/2)];
  }
  // operating on finalbowl
    //special landings
  if(finalBowl.stoneCount === 0 && !(finalBowl.isStore) && finalBowl.player === playerTurn){
    //capture mirror bowl & that last piece
    var capturedBowlPosition = (inputHowManyBowls - finalBowl.position - 2);
    var capturedBowl = battlefield[capturedBowlPosition];
    capturedStones = capturedBowl.stoneCount + 1; //the placed piece is the 1
    capturedBowl.stoneCount = 0;
    if(playerTurn === "player1"){
      if(Math.floor(Math.random()*2) === 1){
        marioHoohoo.play();
      } else {
        marioHaha.play();
      }
      player1Store.stoneCount += capturedStones;
    } else if (playerTurn === "player2"){
      booLaugh.play();
      player2Store.stoneCount += capturedStones;
    }
    swapTurns();
  } else if(finalBowl.isStore) {
    finalBowl.stoneCount += 1;
    //no turn swap, extra turn!!
  }
  else {
    finalBowl.stoneCount += 1;
    swapTurns();
  }
};

var gameEndTest = function(){
  var playerBowlCount = (inputHowManyBowls/2)-1; // 14 returns 6
  var player1Ends = true; //always set = && bowl empty when looping through each
  var player2Ends = true;
  var bowlEmpty = false;
  for(i=0;i<playerBowlCount;i++){ //player1s bowls except store
    bowlEmpty = false;
    if(battlefield[i].stoneCount === 0){
      bowlEmpty = true;
    }
    player1Ends = (player1Ends && bowlEmpty);

  }
  for(i=playerBowlCount+1;i<(inputHowManyBowls-1);i++){//player2s bowls except store
    bowlEmpty = false;
    if(battlefield[i].stoneCount === 0){
      bowlEmpty = true;
    }
    player2Ends = (player2Ends && bowlEmpty);
  }
  if(player1Ends || player2Ends){
    console.log("The Game Has Ended! "); //also remove listeners
    if(player1Ends){
      var stealEm = 0;
      //loop through player 2 cells and capture
      for(i=playerBowlCount+1;i<(inputHowManyBowls-1);i++){ //player 2's bowls except store i=>6-13
        stealEm += battlefield[i].stoneCount;
        battlefield[i].stoneCount = 0;
      }
      player1Store.stoneCount += stealEm;
    } else if (player2Ends){
      var stoleEm = 0;
      //loop through player 1 cells and capture
      for(i=0;i<playerBowlCount;i++){ //i 0-5
        stoleEm += battlefield[i].stoneCount;
        battlefield[i].stoneCount = 0;
      }
      player2Store.stoneCount += stoleEm;
    }
    updateAll();//end
    if(player1Store.stoneCount > player2Store.stoneCount){
      $("#console").text("Mario Wins!!!! Thank you for playing!");
      marioWins.play();
    } else if (player1Store.stoneCount < player2Store.stoneCount){
      $("#console").text("Boo Wins!!!! Thank you for playing!");
      booCelebrate.play();
    }
  }
};

var swapTurns = function(){
  if(playerTurn === "player1"){
    playerTurn = "player2";
    clearInterval(mar);
    boo = booFades();
    $mario.css("background-position", "0px 0px");
    $("#console").css("color", "white");
  }else if(playerTurn === "player2"){
    playerTurn = "player1";
    clearInterval(boo);
    mar = marioRuns();
    $boo.css("opacity", "1");
    $("#console").css("color", "black");
  }
  $(".bowl").toggleClass("clickable");
};

var isItEnemyStore = function(index){
  return (battlefield[index].isStore && battlefield[index].player !== playerTurn);
};


var updateConsole = function(){
  var $cons = $("#console");
  var consString = 0;
  if(playerTurn === "player1"){
    consString = "Mario's turn!";
    if(Math.floor(Math.random() * 4) === 1){
      peachMario.play(); // annoying
    } else {
      marioCel.play();
    }
  } else if(playerTurn === "player2"){
    consString = "Boo's turn!";
    booSelf.play();
  }
  $cons.text(consString);
};

var updateAll = function(){
  for(i=0;i<battlefield.length;i++){
    var bowl = battlefield[i];
    bowl.$el.text(bowl.stoneCount);
  }
  updateConsole();

  //  if(stoneCount < 7){     -- Can't get this to work appropriately
  //   for(i=0;i<=stoneCount;i++){
  //     var $peb = $("<div>");
  //     $peb.addClass("pebble");
  //     bowl.$el.append($peb);
  //   }
  // } else
  // bowl.$el.text(bowl.stoneCount);
};

var determineCSS = function(position, player){
  //notes:
  //var cssString = calculate its top & left values
  //this.$el.css(cssString)
  //these go inside the bowl prototype render method
  var cssObject;
  //they will be appended in the appropriate battlefields
  if(player === "player1"){
    var width = 100/((inputHowManyBowls/2)+1);//positioning with %
    var left = (position+1)*width;
    cssObject = {
        "left": left + "%",
        "width": width + "%",
    };
    player1LeftPositions.push(left);
  } else if(player === "player2"){
    position -= (inputHowManyBowls/2); //sets index 7 = index 0
    var width2 = 100/((inputHowManyBowls/2)+1);//positioning with %
    var left2 = 100 - ((position+2)*width2);
    cssObject = {
        "left": left2 + "%",
        "width": width2 + "%",
    };
    player2LeftPositions.push(left2);
  }
  return cssObject;
  //css({"propertyname":"value","propertyname":"value",...});
};

var gameSetup = function(){
  for (var i = 0; i < inputHowManyBowls; i++) {
    if(i < inputHowManyBowls/2){
      var newBowl = new Bowl({
        position: i,
        player: "player1"
      });
      if(!(newBowl.isStore)){
        newBowl.stoneCount = howManyPebbles;
      }
      battlefield.push(newBowl);
    } else if (inputHowManyBowls/2 <= i < inputHowManyBowls) {
      var newBowl2 = new Bowl({
        position: i,
        player: "player2"
      });
      if(!(newBowl2.isStore)){
        newBowl2.stoneCount = howManyPebbles;
      }
      battlefield.push(newBowl2);
    }
  }
  $("#battlefield2 .bowl").toggleClass("clickable");
  swapTurns();
  updateAll();
  createBackState();
};

var marioRuns = function(){
  var interval = setInterval(function(){
    setTimeout(function(){$mario.css("background-position", "-64px 0px");},100);
    setTimeout(function(){$mario.css("background-position", "-32px 0px");},200);
    setTimeout(function(){$mario.css("background-position", "-64px 0px");},300);
    setTimeout(function(){$mario.css("background-position", "-94px 0px");},400);
  }, 400);
  setTimeout(function(interval){clearInterval(interval);}, 3000);
  return interval;
};

var booFades = function(){
  var interval = setInterval(function(){
    setTimeout(function(){$boo.css("opacity", "0.3");}, 100);
    setTimeout(function(){$boo.css("opacity", "1");}, 600);
  }, 800);
  return interval;
};

var createBackState = function(){
  var backState = [];
  for(i=0;i<battlefield.length;i++){
       backState.push(battlefield[i].stoneCount);
  }
  backState.push(playerTurn); //index 14 of backState = whose turn it was
  backState.push(turnCount);
  buffer.unshift(backState);
};

var rollBack = function(){ // how to make this work for multiple turns?
  var backState = buffer[1];
  for(i=0;i<battlefield.length;i++){
    battlefield[i].stoneCount = backState[i];
  }
  playerTurn = backState[backState.length];
  if(playerTurn === "player1"){
    clearInterval(mar);
    clearInterval(boo);
    mar = marioRuns();
    $("#console").css("color", "black");
    $("#battlefield1 .bowl").addClass("clickable");
    $("#battlefield2 .bowl").removeClass("clickable");
  }else if(playerTurn === "player2"){
    clearInterval(boo);
    clearInterval(mar);
    boo = booFades();
    $("#console").css("color", "white");
    $("#battlefield1 .bowl").removeClass("clickable");
    $("#battlefield2 .bowl").addClass("clickable");
  }
  updateAll();
  buffer.shift();
};

$("#rollback").on("click", function(){
  rollBack();
});

$("#modal").on("keypress", function (e) {
  if (e.charCode === 13) {
    inputHowManyBowls = (Number($("#bowl-count").val()) + 1)*2;
    howManyPebbles = Number($("#pebble-count").val());
    this.remove();
    gameSetup();
    thankYou.play();
  }
});
