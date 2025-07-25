class EnigmaMachine {
    constructor() {
        this.settings = [
            [12,20, 4,23,10, 1,18, 5,25,14 , 8,16, 2,21,11,15, 0,19, 7,13 ,24, 3,17, 9,22, 6],
            [ 7, 1,20,13,25, 2,16, 9,22, 5 , 0,18,11,24,15, 3,10,17, 6,19 , 8,14,21,12, 4,23],
            [24,19, 8,14, 1,21, 0,10, 2,17 , 6,15,23, 4,12,20,25, 7,11,16 , 5, 9, 3,22,13,18],
            [ 1,15, 6,21, 9, 2,20,10, 0,17 , 23,12, 4,25, 8,19,13, 7,22,18 , 3,14, 5,24,16,11],
            [16, 2,24,11, 7,19, 1,14,20, 5 , 23,13, 8,25, 9, 0,17, 3,15,10 ,22, 6,18, 4,12,21]
        ];
        
        this.selectedRotor = [0, 0, 0];
        
        this.rotorStartPos = [0, 0, 0];
        
        this.plugLinkInfo = [];
        
        this.plugColors = ["red", "green", "blue", "yellow", "cyan", "magenta", 
                          "navy", "olive", "teal", "orange", "pink", "purple", "skyblue"];
        
        this.inputText = "";
        this.outputText = "";
        
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    rotor(setting, inputChar) {
        return setting[inputChar];
    }
    
    rotorReverse(setting, inputChar) {
        return setting.indexOf(inputChar);
    }
    
    reflector(inputChar) {
        const setting = [25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0];
        return setting[inputChar];
    }
    
    plugboard(char) {
        const index = this.plugLinkInfo.indexOf(char);
        if (index !== -1) {
            if (index % 2 === 0) {
                if (index + 1 < this.plugLinkInfo.length) {
                    return this.plugLinkInfo[index + 1];
                }
            } else {
                return this.plugLinkInfo[index - 1];
            }
        }
        return char;
    }
    
    rotorShift(idx) {
        const setting = this.settings[this.selectedRotor[idx]];
        const shifted = [setting[setting.length - 1], ...setting.slice(0, -1)];
        this.settings[this.selectedRotor[idx]] = shifted;
        
        this.rotorStartPos[idx] = (this.rotorStartPos[idx] + 1) % 26;
        
        if (idx < 2) {
            this.rotorShift(idx + 1);
        }
    }
    
    processInput(char) {
        const alphabet = char.charCodeAt(0) - 65;
        
        const pb1 = this.plugboard(alphabet);
        console.log("pb1:", pb1);
        
        const r1 = this.rotor(this.settings[this.selectedRotor[0]], pb1);
        const r2 = this.rotor(this.settings[this.selectedRotor[1]], r1);
        const r3 = this.rotor(this.settings[this.selectedRotor[2]], r2);
        
        const rf = this.reflector(r3);
        
        const r3r = this.rotorReverse(this.settings[this.selectedRotor[2]], rf);
        const r2r = this.rotorReverse(this.settings[this.selectedRotor[1]], r3r);
        const r1r = this.rotorReverse(this.settings[this.selectedRotor[0]], r2r);
        
        const pb2 = this.plugboard(r1r);
        console.log("pb2:", pb2);
        
        this.rotorShift(0);
        
        return pb2;
    }
    
    limitText(text, maxLength) {
        if (text.length > maxLength) {
            return text.slice(-maxLength);
        }
        return text;
    }
    
    updateDisplay() {
        document.querySelectorAll('.rotor-pos-btn').forEach((btn, index) => {
            const rotorIndex = 2 - index;
            btn.textContent = String.fromCharCode(65 + this.rotorStartPos[rotorIndex]);
        });
        
        document.querySelectorAll('.rotor-select-btn').forEach((btn, index) => {
            const rotorIndex = 2 - index;
            btn.textContent = `rotor${rotorIndex + 1}: ${this.selectedRotor[rotorIndex] + 1}`;
        });
        
        document.querySelectorAll('.plug-char').forEach((char, index) => {
            const plugIndex = this.plugLinkInfo.indexOf(index);
            char.className = 'plug-char';
            
            if (plugIndex !== -1) {
                const colorIndex = Math.floor(plugIndex / 2);
                char.classList.add(`plug-color-${colorIndex}`);
                char.classList.add('connected');
            }
        });
        
        document.getElementById('input-text').textContent = this.limitText(this.inputText, 40);
        document.getElementById('output-text').textContent = this.limitText(this.outputText, 40);
    }
    
    lightLamp(charIndex) {
        document.querySelectorAll('.lamp-key').forEach(key => {
            key.classList.remove('active');
        });
        
        if (charIndex >= 0) {
            const lampKey = document.querySelector(`.lamp-key[data-char="${charIndex}"]`);
            if (lampKey) {
                lampKey.classList.add('active');
            }
        }
    }
    
    initializeEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key.match(/[a-zA-Z]/)) {
                const char = event.key.toUpperCase();
                this.inputText += char;
                
                const encryptedIndex = this.processInput(char);
                const encryptedChar = String.fromCharCode(65 + encryptedIndex);
                this.outputText += encryptedChar;
                
                this.updateDisplay();
                this.lightLamp(encryptedIndex);
            }
        });
        
        document.querySelectorAll('.rotor-pos-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const rotorIndex = 2 - index;
                this.rotorShift(rotorIndex);
                this.updateDisplay();
            });
        });
        
        document.querySelectorAll('.rotor-select-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const rotorIndex = 2 - index;
                this.selectedRotor[rotorIndex] = (this.selectedRotor[rotorIndex] + 1) % 5;
                this.updateDisplay();
            });
        });
        
        document.querySelectorAll('.plug-char').forEach((char, index) => {
            char.addEventListener('click', () => {
                if (!this.plugLinkInfo.includes(index)) {
                    this.plugLinkInfo.push(index);
                    this.updateDisplay();
                }
            });
        });
    }
}

const enigma = new EnigmaMachine();
