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

// Menu Data
const menuData = {
    monday: [
        { name: "American Coffee", img: "Images/Menu_Items/OrangeJuice.jpeg", price: 45 },
        { name: "Blueberry Muffin", img: "Images/Menu_Items/BlueberryMuffin.png", price: 55 },
        { name: "Classic Croissant", img: "Images/Menu_Items/Croissant.jpg", price: 48 },
        { name: "Green Tea", img: "Images/Menu_Items/GreenTea.jpg", price: 40 },
        { name: "Ham and Cheese Bagel", img: "Images/Menu_Items/Bagel.jpg", price: 85 },
        { name: "Orange Juice", img: "Images/Menu_Items/OrangeJuice.jpeg", price: 35 }
    ],
    tuesday: [
        { name: "Cappuccino", img: "Images/Menu_Items/Capuchino.jpg", price: 58 },
        { name: "Chocolate Cookie", img: "Images/Menu_Items/ChocolateCookie.jpg", price: 32 },
        { name: "Avocado Toast", img: "Images/Menu_Items/AvocadoToast.jpg", price: 110 },
        { name: "Iced Latte", img: "Images/Menu_Items/IceLatte.jpg", price: 65 },
        { name: "Banana Bread", img: "Images/Menu_Items/BananaBread.jpg", price: 45 },
        { name: "Early Grey Tea", img: "Images/Menu_Items/GreenTea.jpg", price: 42 }
    ],
    wednesday: [
        { name: "Espresso", img: "Images/Menu_Items/Espresso.jpg", price: 38 },
        { name: "Ham and Cheese Bagel", img: "Images/Menu_Items/Bagel.jpg", price: 85 },
        { name: "Cinnamon Roll", img: "Images/Menu_Items/CinnamonRoll.jpg", price: 52 },
        { name: "Hot Chocolate", img: "Images/Menu_Items/HotChocolate.jpg", price: 55 },
        { name: "Fruit Bowl", img: "Images/Menu_Items/FruitBowl.jpg", price: 75 },
        { name: "American Coffee", img: "Images/Menu_Items/AmericanCoffee.jpg", price: 45 }
    ],
    thursday: [
        { name: "Flat White", img: "Images/Menu_Items/FlatWhite.jpg", price: 62 },
        { name: "Chicken Sandwich", img: "Images/Menu_Items/ChickenSandwich.jpg", price: 95 },
        { name: "Brownie", img: "Images/Menu_Items/Brownie.jpg", price: 48 },
        { name: "Chai Latte", img: "Images/Menu_Items/ChaiLatte.jpg", price: 68 },
        { name: "Classic Croissant", img: "Images/Menu_Items/Croissant.jpg", price: 48 },
        { name: "Cold Brew", img: "Images/Menu_Items/ColdBrew.jpg", price: 60 }
    ],
    friday: [
        { name: "Mocha Coffee", img: "Images/Menu_Items/Mocha.jpg", price: 65 },
        { name: "Grilled Cheese Sandwich", img: "Images/Menu_Items/GrilledCheese.jpg", price: 88 },
        { name: "Blueberry Muffin", img: "Images/Menu_Items/BlueberryMuffin.png", price: 55 },
        { name: "Matcha Latte", img: "Images/Menu_Items/Matcha.jpg", price: 72 },
        { name: "Greek Yogurt Parfait", img: "Images/Menu_Items/Parfait.jpg", price: 82 },
        { name: "Iced Latte", img: "Images/Menu_Items/IceLatte.jpg", price: 65 }
    ],
    saturday: [
        { name: "Caramel Macchiato", img: "Images/Menu_Items/CaramelMacchiato.jpeg", price: 70 },
        { name: "Waffles with Syrup", img: "Images/Menu_Items/Waffle.jpg", price: 105 },
        { name: "Chocolate Cookie", img: "Images/Menu_Items/ChocolateCookie.jpg", price: 32 },
        { name: "Orange Juice", img: "Images/Menu_Items/OrangeJuice.jpeg", price: 35 },
        { name: "Avocado Toast", img: "Images/Menu_Items/AvocadoToast.jpg", price: 110 },
        { name: "Cappuccino", img: "Images/Menu_Items/Capuchino.jpg", price: 58 }
    ],
    sunday: [
        { name: "Cold Brew", img: "Images/Menu_Items/ColdBrew.jpg", price: 60 },
        { name: "Grilled Cheese Sandwich", img: "Images/Menu_Items/GrilledCheese.jpg", price: 88 },
        { name: "Cinnamon Roll", img: "Images/Menu_Items/CinnamonRoll.jpg", price: 52},
        { name: "American Coffee", img: "Images/Menu_Items/AmericanCoffee.jpg", price: 45 },
        { name: "Chiken Sandwich", img: "Images/Menu_Items/ChickenSandwich.jpg", price: 95 },
        { name: "Fruit Bowl", img: "Images/Menu_Items/FruitBowl.jpg", price: 75}
    ]
};

// Menu responsive grid
const menuGrid = document.getElementById("menuGrid");

function updateMenu(day) {
    menuGrid.innerHTML = "";

    const items = menuData[day];

    items.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("menu-item");

        card.innerHTML = `
        <img class="menu__item__img" src="${item.img}" alt="${item.name}">
        <div class="menu__item__info">
        <p>${item.name}</p>
        <span class="price">$ ${item.price}</span>
        </div>`;

        menuGrid.appendChild(card);
    })
};

// Day selector buttons
const dayButtons = document.querySelectorAll(".day");

dayButtons.forEach(button => {
    button.addEventListener("click", () => {
        dayButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const day = button.dataset.day;
        updateMenu(day);
    });
});

updateMenu("monday");
document.querySelector('[data-day="monday"').classList.add("active");