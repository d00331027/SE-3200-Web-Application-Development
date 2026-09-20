const drawButton = document.querySelector("#drawButton");
const cardContainer = document.querySelector("#cardContainer");

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

let cards = []

drawButton.disabled = true;
fetch("https://tarotapi.dev/api/v1/cards")
    .then(response => response.json())
    .then(data => {
        cards = data.cards;
        drawButton.disabled = false; // Enable button once all cards are loaded
    });

// Override mismatched names
const imageNameOverrides = {
    "Ace of Pentacles": "One of Pentacles",
    "Ace of Swords": "One of Swords",
    "Fortitude": "Strength",
    "The Last Judgment": "Judgement",
    "Wheel Of Fortune": "Wheel of Fortune"
};

drawButton.onclick = function() {
    if (cards.length === 0) {
        return;
    }

    cardContainer.innerHTML = ""; // Clear card container after each click

    const randomIndex = Math.floor(Math.random() * cards.length);
    const randomCard = cards[randomIndex];
    
    // Create image and information containers
    const cardImage = document.createElement("div");
    cardImage.className = "cardImage";

    const cardInfo = document.createElement("div");
    cardInfo.className = "cardInfo";

    cardContainer.appendChild(cardImage);
    cardContainer.append(cardInfo);

    // Card Name
    const cardName = document.createElement("h2");
    cardName.textContent = randomCard.name;
    cardInfo.appendChild(cardName);

    // Card Image
    let imageName = randomCard.name;

    if (imageNameOverrides[randomCard.name]) {
        imageName = imageNameOverrides[randomCard.name];
    }

    const fileName = imageName +
        " (Rider-Waite Smith tarot deck).png";

    const cardImg = document.createElement("img");

    cardImg.src =
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/" +
        encodeURIComponent(fileName) +
        "?width=500";

    cardImg.alt = randomCard.name;

    cardImage.appendChild(cardImg);

    // Card Type
    const cardType = document.createElement("p");
    cardType.textContent = "Type: " + capitalizeFirstLetter(randomCard.type);
    cardInfo.appendChild(cardType);

    // Card Description
    const cardDescription = document.createElement("p");
    cardDescription.textContent = "Description: " + randomCard.desc;
    cardInfo.appendChild(cardDescription);

    // Upright meaning
    const upright = document.createElement("p");
    upright.textContent = "Upright meaning: " + randomCard.meaning_up;
    cardInfo.appendChild(upright);

    // Reversed meaning
    const reversed = document.createElement("p");
    reversed.textContent = "Reversed meaning: " + randomCard.meaning_rev;
    cardInfo.appendChild(reversed);
};