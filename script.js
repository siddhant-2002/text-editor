// Global Variables
const canvas = document.getElementById('canvas');
const colorPicker = document.getElementById('color-picker');
const fontFamily = document.getElementById('font-family');
const fontSize = document.getElementById('font_size');

let activeTextElement = null;

// Event Listeners
canvas.addEventListener('click', CanvasClick);
fontFamily.addEventListener('change', FontFamily);
fontSize.addEventListener('input', FontSize);
colorPicker.addEventListener('input', FontColor);


// undo and redo Functions
let stack = [];
let stackIndex = -1;

function undo() {
    if (stackIndex > 0) {
        stackIndex--;
        activeTextElement.innerHTML = stack[stackIndex];
    }
}

function redo() {
    if (stackIndex < stack.length - 1) {
        stackIndex++;
        activeTextElement.innerHTML = stack[stackIndex];
    }
}


// Text Element Functions
function CanvasClick(e) {
    const clickedElement = e.target;
    if (clickedElement.classList.contains('textElement')) {
        setActiveTextElement(clickedElement);
        FontFamily();
    }
}

function FontFamily() {
    if (activeTextElement) {
        activeTextElement.style.fontFamily = fontFamily.value;
    }
}

function FontSize() {
    if (activeTextElement) {
        activeTextElement.style.fontSize = `${fontSize.value}px`;
    }
}

function FontColor() {
    if (activeTextElement) {
        activeTextElement.style.color = colorPicker.value;
    }
}

function addText() {
    const textElement = document.createElement('p');
    textElement.className = 'textElement';
    textElement.contentEditable = true;
    textElement.innerText = 'add text ';
    textElement.style.fontSize = fontSize.value + 'px';
    textElement.style.color = colorPicker.value;
    textElement.style.fontFamily = fontFamily.value;
    textElement.style.backgroundColor = 'transparent';
    // textElement.style.border = 'black solid 1px';
    textElement.spellcheck = false;
    textElement.style.left = '250px';
    textElement.style.top = '300px';

    makeDraggable(textElement);
    setupTextElementEvents(textElement);
    canvas.appendChild(textElement);
    setActiveTextElement(textElement);
}

function makeDraggable(element) {
    let offsetX, offsetY, isDragging = false;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - parseFloat(element.style.left);
        offsetY = e.clientY - parseFloat(element.style.top);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            element.style.left = e.clientX - offsetX + 'px';
            element.style.top = e.clientY - offsetY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}


function setupTextElementEvents(textElement) {
    textElement.addEventListener('input', handleTextElementInput);

}

function handleTextElementInput() {
    stack = stack.slice(0, stackIndex + 1);
    stack.push(activeTextElement.innerHTML);
    stackIndex++;
}


function deleteText() {
    if (activeTextElement) {
        canvas.removeChild(activeTextElement);
        activeTextElement = null;
    }
}


function setActiveTextElement(element) {
    if (activeTextElement) {
        activeTextElement.classList.remove('active');
    }
    activeTextElement = element;
    activeTextElement.classList.add('active');
}


