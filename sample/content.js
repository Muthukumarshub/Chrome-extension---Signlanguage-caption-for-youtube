let aslEnabled = false;
let currentVideoId = "";

function getYouTubeCaptions() {
    let captionElement = document.querySelector(".ytp-caption-segment");
    return captionElement ? captionElement.innerText.trim().toLowerCase() : "";
}

function getASLImage(letter) {
    return chrome.runtime.getURL(`images/${letter}.png`);
}

function detectVideoChange() {
    let video = document.querySelector("video");
    if (video) {
        let newVideoId = new URL(window.location.href).searchParams.get("v");
        if (newVideoId && newVideoId !== currentVideoId) {
            currentVideoId = newVideoId;
            aslEnabled = false; 
            let btn = document.getElementById("asl-toggle-btn");
            if (btn) btn.style.background = "#ffcc00"; 
            let aslContainer = document.getElementById("asl-caption-container");
            if (aslContainer) aslContainer.style.display = "none"; 
        }
    }
}

function convertToASL(text) {
    let maxPerRow = 18; 
    let aslContainer = document.getElementById("asl-caption-container");

    if (!aslContainer) {
        aslContainer = document.createElement("div");
        aslContainer.id = "asl-caption-container";
        aslContainer.style.position = "absolute";
        aslContainer.style.bottom = "60px";
        aslContainer.style.left = "50%";
        aslContainer.style.transform = "translateX(-50%)";
        aslContainer.style.background = "rgba(0, 0, 0, 0.7)";
        aslContainer.style.padding = "10px";
        aslContainer.style.borderRadius = "10px";
        aslContainer.style.zIndex = "9999";
        aslContainer.style.display = "flex";
        aslContainer.style.flexDirection = "column";
        aslContainer.style.alignItems = "center";
        aslContainer.style.maxWidth = "90%";
        document.body.appendChild(aslContainer);
    }

    aslContainer.innerHTML = "";

    let words = text.split(" ");
    let rows = [];
    let currentRow = [];

    words.forEach(word => {
        if (currentRow.join(" ").length + word.length > maxPerRow) {
            rows.push(currentRow);
            currentRow = [];
        }
        currentRow.push(word);
    });
    if (currentRow.length) rows.push(currentRow);

    rows.forEach(row => {
        let rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        rowDiv.style.gap = "5px";
        rowDiv.style.marginBottom = "5px";

        row.join(" ").split("").forEach(char => {
            if (/[a-z0-9]/.test(char)) {
                let img = document.createElement("img");
                img.src = getASLImage(char);
                img.alt = char;
                img.style.width = "45px";
                img.style.height = "45px";
                rowDiv.appendChild(img);
            } else if (char === " ") {
                let spaceDiv = document.createElement("div");
                spaceDiv.style.width = "20px";
                rowDiv.appendChild(spaceDiv);
            }
        });

        aslContainer.appendChild(rowDiv);
    });
}

function createToggleButton() {
    let existingButton = document.getElementById("asl-toggle-btn");
    if (existingButton) return;

    let btn = document.createElement("button");
    btn.id = "asl-toggle-btn";
    btn.innerText = "ASL CC";
    btn.style.position = "absolute";
    btn.style.padding = "8px";
    btn.style.background = "#ffcc00";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.zIndex = "9999";

    btn.onclick = () => {
        aslEnabled = !aslEnabled;
        btn.style.background = aslEnabled ? "#00cc66" : "#ffcc00";
        let aslContainer = document.getElementById("asl-caption-container");
        if (aslContainer) aslContainer.style.display = aslEnabled ? "flex" : "none";
    };

    function positionButton() {
        let ccButton = document.querySelector(".ytp-subtitles-button");
        if (ccButton) {
            let rect = ccButton.getBoundingClientRect();
            btn.style.bottom = `${window.innerHeight - rect.top + 10}px`;
            btn.style.left = `${rect.left}px`;
        }
    }

    document.body.appendChild(btn);
    setInterval(positionButton, 1000);
}

setInterval(() => {
    let currentCaption = getYouTubeCaptions();
    if (aslEnabled && currentCaption) convertToASL(currentCaption);
}, 1000);

setInterval(detectVideoChange, 2000);

setTimeout(createToggleButton, 3000);
