var n = 10;
var time = 25;
const array = [];
var progress = false;

init();

let audioCtx = null;

function playNote(freq) {
    if (audioCtx === null) {
        audioCtx = new AudioContext();
    }
    const dur = 0.1;

    if (!isFinite(freq)) {
        console.error("Invalid frequency:", freq);
        return; // Exit if frequency is invalid
    }
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
    const node = audioCtx.createGain();
    node.gain.value = 0.025;
    node.gain.linearRampToValueAtTime(
      0, audioCtx.currentTime + dur
    );
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function generate(){
  if (!progress){
    progress = true;
    init();
    progress = false;
  }
}

function init() {
    array.length = 0;
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    showBars();
}

function play(algoType) {
    if (!progress) {
        progress = true;
        document.getElementById("rangeSlider").disabled = true;
        const copy = [...array];

        let moves;
        if (algoType === 'bubbleSort') {
            moves = bubbleSort(copy);
        } else if (algoType === 'quickSort') {
            moves = quickSort(copy);
        } else if (algoType === 'mergeSort') {
            moves = mergeSort(copy);
        } else {
            console.error("Unknown sorting algorithm");
            return;
        }

        animate(moves);
    } else {
        console.log("Sorting is already in progress");
    }
}


function animate(moves) {
    if (moves.length === 0) {
        showBars();
        progress = false;
        document.getElementById("rangeSlider").disabled = false;
        return;
    }
    const move = moves.shift();

    // Handle swap and compare moves as before
    if (move.type == "swap"){
        const [i, j] = move.indices;
        [array[i], array[j]] = [array[j], array[i]];
        playNote(200 + array[i] * 350);
        playNote(200 + array[j] * 300);
    }

    // Handle copy moves for Merge Sort
    if (move.type === "copy") {
      const [i] = move.indices;
      array[i] = move.value;
      playNote((100 * array[i] + 250));
      console.log((array[i]));
    }

    showBars(move);
    setTimeout(function() {
        animate(moves);
    }, time);

    console.log("Playing note for indices:", move.indices, "Type:", move.type);

}

function bubbleSort(array) {
    const moves = [];
    let swapped;
    do {
        swapped = false;
        for (let i = 1; i < array.length; i++) {
            moves.push({indices: [i - 1, i], type: "comp"});
            if (array[i - 1] > array[i]) {
                swapped = true;
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
                moves.push({indices: [i - 1, i], type: "swap"});
            }
        }
    } while (swapped);
    return moves;
}

function quickSort(array, start = 0, end = array.length - 1, moves = []){
  if (start >= end) return moves;

  let index = partition(array, start, end, moves);

  quickSort(array, start, index - 1, moves);
  quickSort(array, index + 1, end, moves);

  return moves;
}

function partition(array, start, end, moves){
  const pivotValue = array[end];
  let pivotIndex = start;
  for (let i = start; i < end; i++){
    moves.push({indices: [i, end], type: "comp"}); // Compare move
    if (array[i] < pivotValue){
      [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
      moves.push({indices: [i, pivotIndex], type: "swap"}); // Swap move
      pivotIndex++;
    }
  }
  [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];
  moves.push({indices: [pivotIndex, end], type: "swap"}); // Swap move
  return pivotIndex;
}

function mergeSort(array, start = 0, end = array.length - 1, moves = []) {
    if (start < end) {
        let mid = Math.floor((start + end) / 2);
        mergeSort(array, start, mid, moves);
        mergeSort(array, mid + 1, end, moves);
        merge(array, start, mid, end, moves);
    }
    return moves;
}

function merge(array, start, mid, end, moves) {
    let temp = [];
    let i = start, j = mid + 1, k = 0;

    while (i <= mid && j <= end) {
        moves.push({ indices: [i, j], type: "comp" }); // Compare move
        if (array[i] <= array[j]) {
            temp[k++] = array[i++];
        } else {
            temp[k++] = array[j++];
        }
    }

    while (i <= mid) {
        temp[k++] = array[i++];
    }

    while (j <= end) {
        temp[k++] = array[j++];
    }

    for (i = start, k = 0; i <= end; i++, k++) {
      if(array[i] !== temp[k]) {
          array[i] = temp[k];
          moves.push({ indices: [i], type: "copy", value: temp[k] }); // Record the value being copied
      }
    }

}



function showBars(move) {
    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");

        // Set bar color based on move type
        if (move && move.indices.includes(i)) {
            bar.style.background = move.type === "copy" ? "green" : "blue";
        }
        container.appendChild(bar);
    }
}



document.getElementById("rangeSlider").addEventListener("input", function() {
    const sliderValue = this.value;
    // Uncomment this line if you want to display the value
    // document.getElementById("sliderValue").textContent = sliderValue;

    n = parseInt(sliderValue, 10);
    init();
});

document.getElementById("timeSlider").addEventListener("input", function() {
    const actualValue = 150 - this.value;
    // Uncomment this line if you want to display the value
    // document.getElementById("timeSliderValue").textContent = actualValue;

    time = parseInt(actualValue, 10);
});
