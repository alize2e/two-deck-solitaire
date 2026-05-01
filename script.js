"use strict";

// 23/5

// on peut remonter la dame en haut -- see vid
// double-click and then can move card i shouldn't be able to -- see vid

// hard to unselect -- different ui?

// maman's comments
// unable to play after dealing all cards???
// weird stuff with top col, 4 ending up up there despite not having 2 or 3 underneath

// add docstrings
// check for missing semicolons etc
// test distributions?

// fixed i think? ability to move cards out from under other cards to top col
// wtf happened with the three and the spades column, esp. s4??? see screenshots -- fixed i think!!!

const w = 1920/13;
const h = 1150/5;
const dx = w*1.1;
const dy = 0.25*h;
const base = h+1.5*dy;

let deck = [];
let deckID = 0;
let stacks = [];

let selected = null;
let isMiddle = false;
let checkWin = false;

document.getElementById("rules").style.width = `${screen.width}px`;

setup();

function canStackTop(col){
  if(col.length===1){
    return selected.num===1;
  }
  return selected.suit===col[1].suit && selected.num===col[col.length-1].num+1 && parseInt(selected.style.zIndex)===stacks[selected.c].length-1;
}

function win(){
  const text = document.getElementById("space");
  text.removeChild(document.getElementById("rules"));
  text.classList.remove("hidden");
  text.classList.add("win");
  text.textContent = "You won, congratulations! Reload if you have the Patience to play again.";
}

function placeTop(event){
  const col = stacks[event.currentTarget.c];
  if(selected!==null && canStackTop(col)){
    addAccess(); 
    stacks[selected.c].length--;
    moveCard(selected, col[0], col.length, true);
    const tempSelected = selected;
    deselect();
    tempSelected.addEventListener('mouseenter', placeTop);
    if(checkWin){
      let hasWon = true;
      for(let i = -1; i>=-8; i--){
        if(stacks[i].length<14){
          hasWon = false;
        }
      }
      if(hasWon){
        win();
      }
    }
  }
}

function getTopCol(c){
  if(0<=c && c<4){
    return -c-1;
  }
  return 1-c;
}

function placeEmpty(event){ 
  const temp = event.currentTarget;
  if(stacks[temp.c].length===0 && selected!==null && !isMiddle){
    placeBottom(temp, true);
  }
}

function spots(){
  for(let c=0; c<10; c++){
    if(c<4 || c>5){
      const spot = document.createElement('img');
      spot.src = "imgs/spot.png";
      spot.style.left = `${dx*c}px`;
      spot.addEventListener('mouseenter', placeTop);
      spot.c = getTopCol(c);
      stacks[spot.c][0] = spot;
      document.querySelector('body').appendChild(spot);
    }
    const spot = document.createElement('img');
    spot.src = "imgs/spot.png";
    spot.style.left = `${dx*c}px`;
    spot.style.top = `${base}px`;
    spot.style.zIndex = 0;
    spot.c = c;
    spot.addEventListener('mouseenter', placeEmpty);
    document.querySelector('body').appendChild(spot);
  }
}

function FisherYates(){ // adapted from w3schools
  for (let i = deck.length-1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i+1));
    let k = deck[i];
    deck[i] =  deck[j];
    deck[j] = k;
  }
}

function makeDeck(){
  const s = "shcd";
  for(let i = 0; i<4; i++){
    for(let j = 1; j<=13; j++){
      deck.push(`imgs/${s[i]}${j}.png`);
      deck.push(`imgs/${s[i]}${j} copy.png`);
    }
  }
  FisherYates();
}

function select(event){
  selected = event.currentTarget;
  selected.removeEventListener('mouseleave', removeTake);
  isMiddle = selected.c===-9;
}

function deselect(){
  selected.classList.remove("canTake");
  selected.addEventListener('mouseenter', canTake);
  selected = null;
}

function moveCard(card, dest, z, top=false, empty=false){
  if(empty){
    z -= 1;
  }
  card.c = dest.c;
  stacks[dest.c][z] = card;
  card.style.left = dest.style.left;
  if(top){
    card.style.top = "0px";
  }
  else{
    card.style.top = `${base+z*dy}px`;
  }
  card.style.zIndex = z;
}

function addAccess(){
  if(selected.style.zIndex>0){
    const temp = stacks[selected.c][selected.style.zIndex-1];
    temp.addEventListener('mouseenter', canTake);
    if(temp.src.slice(temp.src.length-13)==="imgs/back.png"){
      temp.src = temp.id;
    }
    else{
      let i = temp.style.zIndex; // parseInt?
      while(i>0 && stacks[selected.c][i-1].src.slice(stacks[selected.c][i-1].src.length-13)!=="imgs/back.png" && canStackBottom(stacks[selected.c][i-1],stacks[selected.c][i])){
        stacks[selected.c][i-1].addEventListener('mouseenter', canTake);
        i--;
      }
    }
  }
}

function placeBottom(dest, empty = false){
  addAccess();
  for(let i = parseInt(selected.style.zIndex)+1; i<stacks[selected.c].length; i++){
    moveCard(stacks[selected.c][i], dest, parseInt(dest.style.zIndex)+i+1-parseInt(selected.style.zIndex), false, empty);
  }
  stacks[selected.c].length = selected.style.zIndex;
  moveCard(selected, dest, parseInt(dest.style.zIndex)+1, false, empty);
  deselect();
}

function canStackBottom(dest, card=selected){
  if(dest.c < 0){
    return false;
  }
  if(card.c === -9){ // equivalent to isMiddle if card===selected
    return false;
  }
  if(card.num!==dest.num-1){
    return false;
  }
  if((card.suit==='h' || card.suit==='d')&&(dest.suit==='h' || dest.suit==='d')){
    return false;
  }
  if((card.suit==='c' || card.suit==='s')&&(dest.suit==='c' || dest.suit==='s')){
    return false;
  }
  return true;
}

function canTake(event){
  const temp = event.currentTarget;
  if(selected!==null){
    if(parseInt(temp.style.zIndex)===stacks[temp.c].length-1 && temp!==selected && canStackBottom(temp)){
      placeBottom(temp);
    }
    else if(temp===selected){
      deselect();
    }
  }
  else{
    temp.classList.add("canTake");
    temp.addEventListener('click', select);
    temp.addEventListener('mouseleave', removeTake);
  }
}

function removeTake(event){
  event.currentTarget.classList.remove("canTake");
}

function makeCard(z, c, left, top=0, show = false){
  const temp = document.createElement('img');
  temp.setAttribute('id',deck[deckID]);
  temp.suit = temp.id[5];
  temp.num = parseInt(temp.id[6]);
  if(!isNaN(parseInt(temp.id[7]))){ // clean up code -- maybe make deck of pairs of suits and nums, and assign ids based on that. or no ids
    temp.num = parseInt(temp.id.slice(6,8));
  }
  deckID++;
  temp.src = "imgs/back.png";
  temp.style.zIndex = z;
  temp.c = c;
  temp.style.left = `${left}px`;
  temp.style.top = `${top}px`;
  if(show){
    temp.src = temp.id;
    if(temp.style.top!=="0px" || temp.c===-9){
      temp.addEventListener('mouseenter', canTake); 
    }
  }
  stacks[c].push(temp);
  document.querySelector('body').appendChild(temp);
  return temp;
}

function distributeStart(){
  // add some sort of delay to show?
  for(let i = 0; i<5; i++){
    for(let j = i; j<10-i; j++){
      makeCard(i, j, dx*j, base+dy*i, j===i || j===9-i);
    }
    makeCard(i, -9, dx*4.5, 0, i===4);
  }
}

function removeAccess(arr){
  for(let i = arr.length-2; i>=0; i--){
    arr[i].removeEventListener('mouseenter', canTake);
  }
}

function rules(){
  const text = document.getElementById("rules");
  if(text.classList.contains('hidden')){
    text.classList.remove("hidden");
    document.getElementById("space").classList.remove("hidden");
  }
  else{
    text.classList.add("hidden");
    document.getElementById("space").classList.add("hidden");
  }
}

function deal(){
  let col = 0;
  const deckIDtemp = deckID;
  if(selected!==null){
    deselect();
  }
  while(col<10 && deckID<2*52){
    if(stacks[col].length===0 || stacks[col][0].num!==13 || stacks[col][0].src.slice(stacks[col][0].src.length-13)==="imgs/back.png"){
      makeCard(stacks[col].length, col, dx*col, base+dy*stacks[col].length, true);
      // update access of cards below
      if(stacks[col].length>1 && !canStackBottom(stacks[col][stacks[col].length-2],stacks[col][stacks[col].length-1])){
        removeAccess(stacks[col]);
      }
    }
    col++;
  }
  if(deckID>=2*52){
    document.removeEventListener('keydown', deal);
    document.getElementById("space").classList.add("allDealt");
    checkWin = true;
  }
}

function key(event){
  if(event.keyCode===82){ // if press 'r'
    rules();
  }
  else if(event.keyCode===68){ // if press 'd'
    deal();
  }
}

function initStack(){
  for(let i = -9; i<=9; i++){
    stacks[i]=[];
  }
}

function setup(){
  initStack();
  spots();
  makeDeck();
  distributeStart();
  document.addEventListener('keydown', key);
}