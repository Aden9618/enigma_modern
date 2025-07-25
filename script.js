let selectedRotors = [0, 1, 2];
let rotorPositions = [0, 0, 0];
let plugConnections = [];
let plugColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff',
                 '#ff8844', '#88ff44', '#4488ff', '#ff4488', '#88ff88', '#ff8888', '#8888ff'];
let inputText = '';
let outputText = '';
let currentLit = -1;

const rotorSettings = [
    [12,20, 4,23,10, 1,18, 5,25,14 ,  8,16, 2,21,11,15, 0,19, 7,13 , 24, 3,17, 9,22, 6],
    [ 7, 1,20,13,25, 2,16, 9,22, 5 ,  0,18,11,24,15, 3,10,17, 6,19 ,  8,14,21,12, 4,23],
    [24,19, 8,14, 1,21, 0,10, 2,17 ,  6,15,23, 4,12,20,25, 7,11,16 ,  5, 9, 3,22,13,18],
    [ 1,15, 6,21, 9, 2,20,10, 0,17 , 23,12, 4,25, 8,19,13, 7,22,18 ,  3,14, 5,24,16,11],
    [16, 2,24,11, 7,19, 1,14,20, 5 , 23,13, 8,25, 9, 0,17, 3,15,10 , 22, 6,18, 4,12,21]
];

let currentRotorSettings = rotorSettings.map(rotor => [...rotor]);

function init() {
    createPlugboard();
    updateDisplay();
    setupKeyboardInput();
}

function createPlugboard() {
    const row1 = document.getElementById('plugboard-row1');
    const row2 = document.getElementById('plugboard-row2');
   
    for (let i = 0; i < 13; i++) {
        const plug = document.createElement('div');
        plug.className = 'plug';
        plug.textContent = String.fromCharCode(65 + i);
        plug.onclick = () => togglePlug(i);
        plug.id = `plug-${i}`;
        row1.appendChild(plug);
    }
   
    for (let i = 13; i < 26; i++) {
        const plug = document.createElement('div');
        plug.className = 'plug';
        plug.textContent = String.fromCharCode(65 + i);
        plug.onclick = () => togglePlug(i);
        plug.id = `plug-${i}`;
        row2.appendChild(plug);
    }
}

function togglePlug(letterIndex) {
    const existingIndex = plugConnections.findIndex(conn => conn.includes(letterIndex));
   
    if (existingIndex !== -1) {
        const connection = plugConnections[existingIndex];
        connection.forEach(idx => {
            document.getElementById(`plug-${idx}`).style.borderColor = 'white';
            document.getElementById(`plug-${idx}`).classList.remove('connected');
        });
        plugConnections.splice(existingIndex, 1);
    } else {
        const unpaired = plugConnections.find(conn => conn.length === 1);
       
        if (unpaired) {
            unpaired.push(letterIndex);
            const colorIndex = plugConnections.indexOf(unpaired);
            const color = plugColors[colorIndex % plugColors.length];
           
            unpaired.forEach(idx => {
                document.getElementById(`plug-${idx}`).style.borderColor = color;
                document.getElementById(`plug-${idx}`).classList.add('connected');
            });
        } else {
            const newConnection = [letterIndex];
            plugConnections.push(newConnection);
            const colorIndex = plugConnections.length - 1;
            const color = plugColors[colorIndex % plugColors.length];
           
            document.getElementById(`plug-${letterIndex}`).style.borderColor = color;
        }
    }
}

function shiftRotor(rotorIndex) {
    rotorPositions[rotorIndex] = (rotorPositions[rotorIndex] + 1) % 26;
   
    const rotor = selectedRotors[rotorIndex];
    currentRotorSettings[rotor] = rotateArray(currentRotorSettings[rotor], 1);
   
    updateDisplay();
}

function advanceRotors() {
    rotorPositions[0] = (rotorPositions[0] + 1) % 26;
    currentRotorSettings[selectedRotors[0]] = rotateArray(currentRotorSettings[selectedRotors[0]], 1);
   
    if (rotorPositions[0] === 0) {
        rotorPositions[1] = (rotorPositions[1] + 1) % 26;
        currentRotorSettings[selectedRotors[1]] = rotateArray(currentRotorSettings[selectedRotors[1]], 1);
    }
   
    if (rotorPositions[1] === 0 && rotorPositions[0] === 0) {
        rotorPositions[2] = (rotorPositions[2] + 1) % 26;
        currentRotorSettings[selectedRotors[2]] = rotateArray(currentRotorSettings[selectedRotors[2]], 1);
    }
}

function rotateArray(arr, shift) {
    const result = [...arr];
    for (let i = 0; i < shift; i++) {
        //result.unshift(result.pop());
        result.push(result.shift());
    }
    return result;
}

function selectRotor(rotorIndex) {
    selectedRotors[rotorIndex] = (selectedRotors[rotorIndex] + 1) % 5;
    updateDisplay();
}

function updateDisplay() {
    for (let i = 0; i < 3; i++) {
        document.getElementById(`rotor${i}`).textContent = String.fromCharCode(65 + rotorPositions[i]);
        document.getElementById(`rotor-sel-${i}`).textContent = selectedRotors[i] + 1;
    }
   
    document.getElementById('input-text').textContent = inputText.slice(-40);
    document.getElementById('output-text').textContent = outputText.slice(-40);
}

function plugboard(charIndex) {
    const connection = plugConnections.find(conn => conn.length === 2 && conn.includes(charIndex));
    if (connection) {
        return connection.find(idx => idx !== charIndex);
    }
    return charIndex;
}

function rotor(setting, inputChar) {
    return setting[inputChar];
}

function rotorReverse(setting, inputChar) {
    return setting.indexOf(inputChar);
}

function reflector(inputChar) {
    const setting = [25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0];
    return setting[inputChar];
}

function encryptChar(char) {
    const alphabet = char.charCodeAt(0) - 65;
   
    const pb1 = plugboard(alphabet);
   
    const r1 = rotor(currentRotorSettings[selectedRotors[0]], pb1);
    const r2 = rotor(currentRotorSettings[selectedRotors[1]], r1);
    const r3 = rotor(currentRotorSettings[selectedRotors[2]], r2);
   
    const rf = reflector(r3);
   
    const r3r = rotorReverse(currentRotorSettings[selectedRotors[2]], rf);
    const r2r = rotorReverse(currentRotorSettings[selectedRotors[1]], r3r);
    const r1r = rotorReverse(currentRotorSettings[selectedRotors[0]], r2r);
   
    const pb2 = plugboard(r1r);
   
    return pb2;
}

function handleKeyInput(char) {
    if (char >= 'A' && char <= 'Z') {
        inputText += char;
        const encrypted = encryptChar(char);
        outputText += String.fromCharCode(encrypted + 65);
       
        currentLit = encrypted;
        updateLamps();
       
        advanceRotors();
       
        updateDisplay();
       
        setTimeout(() => {
            currentLit = -1;
            updateLamps();
        }, 1000);
    }
}

function handleKeyClick(char) {
    handleKeyInput(char);
}

function updateLamps() {
    document.querySelectorAll('.key').forEach((key, index) => {
        const char = key.getAttribute('data-char');
        const charIndex = char.charCodeAt(0) - 65;
       
        if (charIndex === currentLit) {
            key.classList.add('lit');
        } else {
            key.classList.remove('lit');
        }
    });
}

function setupKeyboardInput() {
    document.addEventListener('keydown', (event) => {
        const char = event.key.toUpperCase();
        if (char >= 'A' && char <= 'Z') {
            event.preventDefault();
            handleKeyInput(char);
        }
    });
}

function resetMachine() {
    selectedRotors = [0, 1, 2];
    rotorPositions = [0, 0, 0];
    plugConnections = [];
    inputText = '';
    outputText = '';
    currentLit = -1;
    currentRotorSettings = rotorSettings.map(rotor => [...rotor]);
   
    document.querySelectorAll('.plug').forEach(plug => {
        plug.style.borderColor = 'white';
        plug.classList.remove('connected');
    });
   
    updateDisplay();
    updateLamps();
}

window.addEventListener('load', init);
