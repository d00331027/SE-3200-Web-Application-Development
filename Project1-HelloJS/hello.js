const paragraph = document.querySelector("#aboutMe");
const messageButton = document.querySelector("#messageButton");
const colorButton = document.querySelector("#colorButton");

messageButton.onclick = function() {
paragraph.textContent = "You clicked the button! This message was changed using JavaScript.";
};

colorButton.onclick = function() {
document.body.style.backgroundColor = "#dce6f1";
};
