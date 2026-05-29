// Button Scrolling
const menuBtn = document.getElementById("menuBtn");
const catsBtn = document.getElementById("catsBtn");

menuBtn.addEventListener("click", () => {
document.getElementById("menuSection").scrollIntoView({
behavior: "smooth"
});
});

catsBtn.addEventListener("click", () => {
document.getElementById("catsSection").scrollIntoView({
behavior: "smooth"
});
});

// Menu
const menuGrid = document.getElementById("menuGrid");

async function updateMenu(day) {

const response =
    await fetch(`/api/menu/${day}`);

const items =
    await response.json();

menuGrid.innerHTML = "";

items.forEach(item => {

    const card =
        document.createElement("div");

    card.classList.add("menu-item");

    card.innerHTML = `
    <img
        class="menu__item__img"
        src="${item.image}"
        alt="${item.name}"
    >

    <div class="menu__item__info">
        <p>${item.name}</p>
        <span class="price">
            $ ${item.price}
        </span>
    </div>
    `;

    menuGrid.appendChild(card);
});

}

// Day selector buttons
const dayButtons = document.querySelectorAll(".day");

dayButtons.forEach(button => {

button.addEventListener("click", () => {

    dayButtons.forEach(btn =>
        btn.classList.remove("active")
    );

    button.classList.add("active");

    const day =
        button.dataset.day;

    updateMenu(day);
});

});

updateMenu("monday");

document
.querySelector('[data-day="monday"]')
.classList.add("active");

// Cats
async function loadCats() {

const response =
    await fetch("/api/cats");

const cats =
    await response.json();

const catsGrid =
    document.getElementById("catsGrid");

catsGrid.innerHTML = "";

cats.forEach(cat => {

    catsGrid.innerHTML += `
    <div class="cat">

        <h3>${cat.name}</h3>

        <img
            src="${cat.image}"
            alt="${cat.name}"
        />

        <p>
            Age: ${cat.age} years
        </p>

        <p>
            Nature:
            ${cat.personality}
        </p>

    </div>
    `;
});

}

loadCats();