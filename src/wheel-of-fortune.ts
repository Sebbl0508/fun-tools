import { X } from "lucide-static";
import { deg2rad, randomInRange } from "./utils";

enum SpinMode {
    SpinUp,
    SpinWait,
    SpinDown,
}

interface WheelParticipant {
    name: string;
    colorHsl: string;
}

const localStorageNamesName = "wheel-of-fortune-names";
let names: WheelParticipant[] = [];

    
const canvas = document.querySelector<HTMLCanvasElement>('#wheel-canvas')!;
if (!canvas.getContext) {
    canvas.innerHTML = "<h1>Cannot use canvas</h1>";
}
const ctx = canvas.getContext('2d')!;
const wheelRadius = (canvas.width / 2) - 50;

let wheelSpeed = 0;
let initialDeg = 270;
let currentlySpinning = false;


export function setupWheelOfFortune() {
    const nameInput = document.querySelector<HTMLInputElement>('#name-input')!;

    nameInput.onkeyup = (evt) => {
        if (evt.key == 'Enter' && nameInput.value !== '' && nameInput.value.replace(/\s/g, '').length > 0) {
            addName(nameInput);
        } else if (evt.key == 'Enter') {
            nameInput.value = '';
        }
    };

    document.querySelector<HTMLButtonElement>('#name-list-add-btn')!.onclick = () => {
        addName(nameInput);
    };

    document.querySelector<HTMLButtonElement>('#spin-button')!.onclick = () => {
        if (!currentlySpinning)
            startSpinning();
    };

    try {
        names = JSON.parse(localStorage.getItem(localStorageNamesName)!) ?? [];
    } catch (_e) {
        names = [];
    }

    updateNameList();
}


function addName(inputElement: HTMLInputElement) {
    names.push({ name: inputElement.value, colorHsl: (Math.random() * 360.0).toString() });
    localStorage.setItem(localStorageNamesName, JSON.stringify(names));

    inputElement.value = "";

    updateNameList();
}

function updateNameList() {
    const nameList = document.querySelector<HTMLUListElement>('#name-list')!;

    nameList.innerHTML = '';
    for (let i = 0; i < names.length; i++) {
        let btn = document.createElement('button');
        btn.onclick = () => removeNameFromList(i);
        btn.innerHTML = X;

        let listItem = document.createElement('li');
        //listItem.textContent = names[i];
        listItem.appendChild(btn);
        listItem.append(names[i].name);
        //listItem.appendChild(btn);

        nameList.appendChild(listItem);
    }

    drawWheelAndArrow();
}

function drawWheelAndArrow() {
    if (names.length === 0) {
        drawEmptyWheel();
    } else {
        drawWheel();
    }
    drawSelectorArrow();
}

function drawWheel() {
    clearCanvas();

    const sliceDegSize = 360 / names.length;

    let curDeg = initialDeg;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(0 0 0)";
    ctx.font = "bold 48px sans";
    for(let i = 0; i < names.length; i++) {
        let endDeg = curDeg + sliceDegSize;

        ctx.fillStyle = `hsl(${names[i].colorHsl}deg 80% 60%)`;

        // draw slice
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, wheelRadius, deg2rad(curDeg), deg2rad(endDeg), false);
        ctx.closePath();
        ctx.fill();

        if (names.length > 1)
            ctx.stroke();

        curDeg = endDeg;
    } 

    curDeg = initialDeg;
    ctx.fillStyle = "rgb(0 0 0)";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.textAlign = "left";
    for(let i = 0; i < names.length; i++) {
        let endDeg = curDeg + sliceDegSize;

        // draw text
        let mid = curDeg + (sliceDegSize / 2);


        let textMetrics = ctx.measureText(names[i].name);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(deg2rad(mid));
        ctx.translate(-(canvas.width / 2), -(canvas.height / 2));

        ctx.fillText(names[i].name, canvas.width / 2 + 90, canvas.height / 2 + textMetrics.hangingBaseline / 2);
        ctx.restore();

        curDeg = endDeg;
    }

    // draw center "knob"
    ctx.fillStyle = "hsl(100deg 100% 60%)";
    ctx.strokeStyle = "rgb(0 0 0)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawEmptyWheel() {
    clearCanvas();

    ctx.textAlign = "center";
    ctx.fillStyle = "#cacaca";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, wheelRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    
    ctx.font = "bold 128px sans";
    ctx.fillStyle = "#000000";
    let textMetrics = ctx.measureText("?");
    ctx.fillText("?", canvas.width / 2, canvas.height / 2 + textMetrics.hangingBaseline / 2);
}

function drawSelectorArrow() {
    let distFromWheel = 10;
    let triangleWidth = 15;
    let middle = canvas.width / 2;

    ctx.moveTo(middle + wheelRadius + distFromWheel, canvas.height / 2);
    ctx.beginPath();
    ctx.lineTo(middle + wheelRadius + distFromWheel, canvas.height / 2 + triangleWidth);
    ctx.lineTo(middle + wheelRadius - distFromWheel, canvas.height / 2);
    ctx.lineTo(middle + wheelRadius + distFromWheel, canvas.height / 2 - triangleWidth);
    ctx.lineTo(middle + wheelRadius + distFromWheel, canvas.height / 2 + triangleWidth);
    ctx.closePath();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#FF0000";
    ctx.stroke();
    ctx.fill();
}

function clearCanvas() {
    ctx.fillStyle = "rgba(0 0 0 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function removeNameFromList(idx: number) {
    names.splice(idx, 1);
    localStorage.setItem(localStorageNamesName, JSON.stringify(names));

    updateNameList();
}

function startSpinning() {
    currentlySpinning = true;

    let initialWheelSpeed = wheelSpeed;

    const minSpeed = 0.01;
    const maxSpeed = 50;
    const aclMultiplier = randomInRange(1.1, 1.2);
    const declMultiplier = randomInRange(0.8, 0.9);
    const maxSpinTime = randomInRange(1000, 5000);

    let spinMode = SpinMode.SpinUp;

    let intvl = setInterval(() => {
        switch (spinMode) {
            case SpinMode.SpinUp:   wheelSpeed = (wheelSpeed + 1.0) * aclMultiplier; break;
            case SpinMode.SpinWait: return;
            case SpinMode.SpinDown: wheelSpeed *= declMultiplier; break;
        }

        if (wheelSpeed > maxSpeed) {
            spinMode = SpinMode.SpinWait;
            setTimeout(() => spinMode = SpinMode.SpinDown, maxSpinTime);
        }

        if (spinMode == SpinMode.SpinDown && wheelSpeed < minSpeed) {
            clearInterval(intvl);
            currentlySpinning = false;
            wheelSpeed = initialWheelSpeed;
            endOfSpinTasks();
        }
    }, 100);
    
    animateWheel();
}

function animateWheel() {
    if (!currentlySpinning)
        return;

    initialDeg = (initialDeg + wheelSpeed) % 360;
    drawWheelAndArrow();
    window.requestAnimationFrame(animateWheel);
}

function endOfSpinTasks() {
    let backwardsDist = Math.abs(360.0 - initialDeg);
    let calcIdx = Math.floor((names.length / 360.0) * backwardsDist);

    let theChosenOne = names[calcIdx];
    console.log(`${theChosenOne.name} was chosen`);
}