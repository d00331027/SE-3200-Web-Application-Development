const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");
const messageList = document.getElementById("messageList");

const API_URL = "http://127.0.0.1:5000/messages";


async function loadMessages() {
    const response = await fetch(API_URL);

    const messages = await response.json();

    messageList.innerHTML = "";

    for (const message of messages) {
        const listItem = document.createElement("li");

        listItem.textContent = message;

        messageList.appendChild(listItem);
    }
}


form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = input.value;

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: message
    });

    if (response.status === 201) {
        input.value = "";
        await loadMessages();
    }
});


loadMessages();