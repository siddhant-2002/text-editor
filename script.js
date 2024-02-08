//undo and redo
class Command {
    constructor(execute, undo, value) {
        this.execute = execute;
        this.undo = undo;
        this.value = value;
    }
}

class CommandStack {
    constructor() {
        this.stack = [];
        this.stackUndo = [];
    }

    execute(command) {
        this.stack.push(command);
        command.execute(command.value);
        this.stackUndo = [];
    }

    undo() {
        var command = this.stack.pop();
        if (command) {
            this.stackUndo.push(command);
            command.undo(command.value);
        }
    }

    redo() {
        var command = this.stackUndo.pop();
        if (command) {
            this.stack.push(command);
            command.execute(command.value);
        }
    }
}


//global variable
const canvas = document.getElementById("canvas");
const colorPicker = document.getElementById("color-picker");
const fontFamily = document.getElementById("font-family");
const fontSize = document.getElementById("font_size");
let activeImage = null;
let slideIndex = 1;

let activeTextElement = null;
let commandStack = new CommandStack();

canvas.addEventListener("click", CanvasClick);
fontFamily.addEventListener("change", () => commandStack.execute(new Command(FontFamily, UndoFontFamily, fontFamily.value)));
fontSize.addEventListener("input", () => commandStack.execute(new Command(FontSize, UndoFontSize, fontSize.value)));
colorPicker.addEventListener("input", () => commandStack.execute(new Command(FontColor, UndoFontColor, colorPicker.value)));

function CanvasClick(e) {
    const clickedElement = e.target;
    if (clickedElement.classList.contains("textElement")) {
        setActiveTextElement(clickedElement);
        commandStack.execute(new Command(FontFamily, UndoFontFamily, fontFamily.value));
    }
}

function FontFamily(value) {
    if (activeTextElement) {
        activeTextElement.style.fontFamily = value;
    }
}

function UndoFontFamily(value) {
    if (activeTextElement) {
        activeTextElement.style.fontFamily = '';
    }
}

function FontSize(value) {
    if (activeTextElement) {
        activeTextElement.style.fontSize = `${value}px`;
    }
}

function UndoFontSize(value) {
    if (activeTextElement) {
        activeTextElement.style.fontSize = '';
    }
}

function FontColor(value) {
    if (activeTextElement) {
        activeTextElement.style.color = value;
    }
}

function UndoFontColor(value) {
    if (activeTextElement) {
        activeTextElement.style.color = '';
    }
}

function addText() {
    const textElement = document.createElement("p");


    // const imageElement = document.getElementsByClassName("imge")[0];
    const imageElement = activeImage;
    const rect = imageElement.getBoundingClientRect();

        // Add a data attribute to the text element that stores the index of the slide it belongs to
        textElement.dataset.slideIndex = slideIndex;

    textElement.className = "textElement";
    textElement.contentEditable = true;
    textElement.innerText = "add text ";
    textElement.style.fontSize = fontSize.value + "px";
    textElement.style.color = colorPicker.value;
    textElement.style.fontFamily = fontFamily.value;
    textElement.style.backgroundColor = "transparent";
    textElement.spellcheck = false;

    // Set initial position to be within the image
    textElement.style.left = rect.left + "px";
    textElement.style.top = rect.top + "px";

    makeDraggable(textElement);
    setupTextElementEvents(textElement);
    canvas.appendChild(textElement);
    setActiveTextElement(textElement);
}

function makeDraggable(element) {
    let offsetX, offsetY, isDragging = false;
    let oldPosition, newPosition;
    // const imageElement = document.getElementsByClassName("imge")[0];

    element.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - parseFloat(element.style.left);
        offsetY = e.clientY - parseFloat(element.style.top);
        oldPosition = { left: element.style.left, top: element.style.top };
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
    
            // Update the imageElement reference
            // const imageElement = document.getElementsByClassName("imge")[0];
            const imageElement = activeImage;
            const rect = imageElement.getBoundingClientRect();
    
            if (newLeft < rect.left) newLeft = rect.left;
            if (newTop < rect.top) newTop = rect.top;
            if (newLeft + element.offsetWidth > rect.right) newLeft = rect.right - element.offsetWidth;
            if (newTop + element.offsetHeight > rect.bottom) newTop = rect.bottom - element.offsetHeight;
    
            element.style.left = newLeft + "px";
            element.style.top = newTop + "px";
            newPosition = { left: element.style.left, top: element.style.top };
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            commandStack.execute(new Command(
                (value) => { element.style.left = value.newPosition.left; element.style.top = value.newPosition.top; },
                (value) => { element.style.left = value.oldPosition.left; element.style.top = value.oldPosition.top; },
                { oldPosition, newPosition }
            ));
        }
        isDragging = false;
    });
}

function setupTextElementEvents(textElement) {
    textElement.addEventListener("input", handleTextElementInput);
}

function setupTextElementEvents(textElement) {
    let oldValue = null;

    textElement.addEventListener("keydown", () => {
        oldValue = textElement.innerText;
    });

    textElement.addEventListener("input", () => {
        const newValue = textElement.innerText;

        if (oldValue !== newValue) {
            commandStack.execute(new Command(
                (value) => { textElement.innerText = value.newValue; },
                (value) => { textElement.innerText = value.oldValue; },
                { oldValue, newValue }
            ));
        }

        oldValue = newValue;
    });
}

function deleteText() {
    if (activeTextElement) {
        const parent = activeTextElement.parentNode;
        const element = activeTextElement;
        commandStack.execute(new Command(
            (value) => { value.element.parentNode.removeChild(value.element); activeTextElement = null; },
            (value) => { value.parent.appendChild(value.element); setActiveTextElement(value.element); },
            { parent, element }
        ));
    }
}

function setActiveTextElement(element) {
    if (activeTextElement) {
        activeTextElement.classList.remove("active");
    }
    activeTextElement = element;
    activeTextElement.classList.add("active");
}


showSlides(slideIndex);

function plusSlides(n) {
    showSlides((slideIndex += n));
}

function currentSlide(n) {
    showSlides((slideIndex = n));
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";

    // Set the active image
    activeImage = slides[slideIndex - 1];

    // Show all text elements that belong to the current slide
    const textElements = document.getElementsByClassName("textElement");
    for (let i = 0; i < textElements.length; i++) {
        if (textElements[i].dataset.slideIndex == slideIndex) {
            textElements[i].style.display = "block";
        } else {
            textElements[i].style.display = "none";
        }
    }

    
}

function undo() {
    commandStack.undo();
}

function redo() {
    commandStack.redo();
}

// new popup

document.getElementById('arrange-slides').addEventListener('click', function() {
    document.getElementById('myModal').style.display = "block";
    $("#slides-container").sortable();
    $("#slides-container").disableSelection();
});

//slides changed get to main slides

function updateMainSlides() {
    let mainSlides = document.getElementById('image').getElementsByTagName('img');
    let slidesContainer = document.getElementById('slides-container').getElementsByTagName('img');
    for (let i = 0; i < mainSlides.length; i++) {
        mainSlides[i].src = slidesContainer[i].src;
    }
}

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('myModal').style.display = "none";
    // updateMainSlides();
});

document.getElementById('apply').addEventListener('click', function() {
    updateMainSlides();
    document.getElementById('myModal').style.display = "none"
});