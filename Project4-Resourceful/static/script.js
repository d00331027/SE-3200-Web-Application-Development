const API_URL = "http://127.0.0.1:5000";

const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("admin-password");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");
const enemyForm = document.getElementById("enemy-form");
const enemyFormMessage = document.getElementById("enemy-form-message");
let isAdmin = false;
let editingEnemyId = null;
let allEnemies = [];

async function loadEnemies() {
    const enemyList = document.getElementById("enemy-list");

    try {
        const response = await fetch(`${API_URL}/enemies`, {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Failed to retrieve enemies.");
        }

        allEnemies = await response.json();

        populateFilters();

        renderEnemies(allEnemies);
        
        filterEnemies();

    } catch (error) {
        console.error(error);
        enemyList.textContent = "Unable to load enemies.";
    }
}

function renderEnemies(enemies) {
    const enemyList = document.getElementById("enemy-list");

    enemyList.innerHTML = "";

    document.getElementById("results-count").textContent =
        `Showing ${enemies.length} enemies`;

    if (enemies.length === 0) {
        enemyList.textContent = "No enemies found.";
        return;
    }

    enemies.forEach(enemy => {
        const enemyCard = document.createElement("article");
        enemyCard.classList.add("enemy-card");

        // Enemy name
        const name = document.createElement("h2");
        name.textContent = enemy.name;

        // Description
        const description = document.createElement("p");
        description.textContent = enemy.description;

        // Enemy attributes
        const attributes = [
            ["Story Phase", enemy.story_phase],
            ["HP", enemy.hp],
            ["Attack", enemy.attack],
            ["Defense", enemy.defense],
            ["MP Recovery", enemy.mp_recovery],
            ["EXP", enemy.exp],
            ["Worlds", enemy.worlds.join(", ") || "None listed"],
            ["Drops", enemy.drops.join(", ") || "None listed"]
        ];

        enemyCard.append(name, description);

        attributes.forEach(([label, value]) => {
            const detail = document.createElement("p");
            detail.textContent = `${label}: ${value}`;
            enemyCard.appendChild(detail);
        });

        if (isAdmin) {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            editButton.addEventListener("click", () => {
                editEnemy(enemy);
            });

            enemyCard.appendChild(editButton);

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteEnemy(enemy.id, enemy.name);
            });

            enemyCard.appendChild(deleteButton);
        }

        enemyList.appendChild(enemyCard);
    });
}

function populateFilters() {
    const worldFilter = document.getElementById("world-filter");
    const dropFilter = document.getElementById("drop-filter");

    // Remember the currently selected filters.
    const selectedWorld = worldFilter.value;
    const selectedDrop = dropFilter.value;

    // Clear old options and restore the default options.
    worldFilter.innerHTML = '<option value="">All Worlds</option>';
    dropFilter.innerHTML = '<option value="">All Drops</option>';

    // Collect unique worlds and drops.
    const worlds = new Set();
    const drops = new Set();

    allEnemies.forEach(enemy => {
        enemy.worlds.forEach(world => worlds.add(world));
        enemy.drops.forEach(drop => drops.add(drop));
    });

    // Add world options alphabetically.
    [...worlds].sort().forEach(world => {
        const option = document.createElement("option");
        option.value = world;
        option.textContent = world;
        worldFilter.appendChild(option);
    });

    // Add drop options alphabetically.
    [...drops].sort().forEach(drop => {
        const option = document.createElement("option");
        option.value = drop;
        option.textContent = drop;
        dropFilter.appendChild(option);
    });

    // Restore previous selections if they still exist.
    worldFilter.value = worlds.has(selectedWorld) ? selectedWorld : "";
    dropFilter.value = drops.has(selectedDrop) ? selectedDrop : "";
}

function filterEnemies() {
    const searchText = document.getElementById("enemy-search").value.toLowerCase().trim();

    const selectedWorld = document.getElementById("world-filter").value;
    const selectedDrop = document.getElementById("drop-filter").value;
    const selectedPhase = document.getElementById("phase-filter").value;
    const selectedSort = document.getElementById("sort-by").value;

    // Filter enemies
    const filteredEnemies = allEnemies.filter(enemy => {
        const matchesName = enemy.name.toLowerCase().includes(searchText);

        const matchesWorld =
            selectedWorld === "" || enemy.worlds.includes(selectedWorld);

        const matchesDrop =
            selectedDrop === "" || enemy.drops.includes(selectedDrop);

        const matchesPhase =
            selectedPhase === "" || enemy.story_phase === selectedPhase;

        return matchesName && matchesWorld && matchesDrop && matchesPhase;
    });

    // Sort enemies
    const sortedEnemies = [...filteredEnemies];

    switch (selectedSort) {
        case "name-asc":
            sortedEnemies.sort((a, b) => a.name.localeCompare(b.name));
            break;

        case "name-desc":
            sortedEnemies.sort((a, b) => b.name.localeCompare(a.name));
            break;

        case "hp-asc":
            sortedEnemies.sort((a, b) => a.hp - b.hp);
            break;

        case "hp-desc":
            sortedEnemies.sort((a, b) => b.hp - a.hp);
            break;

        case "attack-asc":
            sortedEnemies.sort((a, b) => a.attack - b.attack);
            break;

        case "attack-desc":
            sortedEnemies.sort((a, b) => b.attack - a.attack);
            break;

        case "defense-asc":
            sortedEnemies.sort((a, b) => a.defense - b.defense);
            break;

        case "defense-desc":
            sortedEnemies.sort((a, b) => b.defense - a.defense);
            break;

        case "exp-asc":
            sortedEnemies.sort((a, b) => a.exp - b.exp);
            break;

        case "exp-desc":
            sortedEnemies.sort((a, b) => b.exp - a.exp);
            break;
    }

    renderEnemies(sortedEnemies);
}


function editEnemy(enemy) {
    editingEnemyId = enemy.id;

    document.getElementById("name").value = enemy.name;
    document.getElementById("description").value = enemy.description;
    document.getElementById("story-phase").value = enemy.story_phase;
    document.getElementById("hp").value = enemy.hp;
    document.getElementById("attack").value = enemy.attack;
    document.getElementById("defense").value = enemy.defense;
    document.getElementById("mp-recovery").value = enemy.mp_recovery;
    document.getElementById("exp").value = enemy.exp;
    document.getElementById("worlds").value = enemy.worlds.join(", ");
    document.getElementById("drops").value = enemy.drops.join(", ");

    document.getElementById("enemy-form-title").textContent = "Edit Enemy";
    document.getElementById("enemy-submit-button").textContent = "Save Changes";
    document.getElementById("cancel-edit-button").hidden = false;

    document.getElementById("enemy-form-section").scrollIntoView({
        behavior: "smooth"
    });
}

async function deleteEnemy(enemyId, enemyName) {
    const confirmed = confirm(
        `Are you sure you want to delete ${enemyName}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/enemies/${enemyId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete enemy.");
        }

        enemyFormMessage.textContent = data.success;

        await loadEnemies();

    } catch (error) {
        enemyFormMessage.textContent = error.message;
    }
}

async function checkAdminStatus() {
    try {
        const response = await fetch(`${API_URL}/admin/status`, {
            credentials: "include"
        });

        const data = await response.json();

        isAdmin = data.is_admin;

        logoutButton.hidden = !isAdmin;

        document.getElementById("enemy-form-section").hidden = !isAdmin;

    } catch (error) {
        console.error("Unable to check administrator status:", error);
        isAdmin = false;
    }

    await loadEnemies();
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = passwordInput.value;

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        loginMessage.textContent = data.success;
        passwordInput.value = "";
        logoutButton.hidden = false;
        isAdmin = true;
        await loadEnemies();
        document.getElementById("enemy-form-section").hidden = false;

    } catch (error) {
        loginMessage.textContent = error.message;
    }
});

logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch(`${API_URL}/admin/logout`, {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        loginMessage.textContent = data.success;
        logoutButton.hidden = true;
        isAdmin = false;
        editingEnemyId = null;
        await loadEnemies();
        document.getElementById("enemy-form-section").hidden = true;

    } catch (error) {
        loginMessage.textContent = error.message;
    }
});

enemyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const enemy = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        story_phase: document.getElementById("story-phase").value,
        hp: Number(document.getElementById("hp").value),
        attack: Number(document.getElementById("attack").value),
        defense: Number(document.getElementById("defense").value),
        mp_recovery: Number(document.getElementById("mp-recovery").value),
        exp: Number(document.getElementById("exp").value),
        worlds: document.getElementById("worlds").value
            .split(",")
            .map(world => world.trim())
            .filter(world => world !== ""),
        drops: document.getElementById("drops").value
            .split(",")
            .map(drop => drop.trim())
            .filter(drop => drop !== "")
    };

    try {
        const method = editingEnemyId === null ? "POST" : "PUT";

        const url = editingEnemyId === null
            ? `${API_URL}/enemies`
            : `${API_URL}/enemies/${editingEnemyId}`;

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(enemy)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to add enemy.");
        }

        enemyFormMessage.textContent = data.success;

        enemyForm.reset();

        editingEnemyId = null;

        document.getElementById("enemy-form-title").textContent = "Add an Enemy";
        document.getElementById("enemy-submit-button").textContent = "Add Enemy";
        document.getElementById("cancel-edit-button").hidden = true;

        await loadEnemies();

    } catch (error) {
        enemyFormMessage.textContent = error.message;
    }
});

// Cancel edit button
document.getElementById("cancel-edit-button").addEventListener("click", () => {
    editingEnemyId = null;

    enemyForm.reset();

    document.getElementById("enemy-form-title").textContent = "Add an Enemy";
    document.getElementById("enemy-submit-button").textContent = "Add Enemy";
    document.getElementById("cancel-edit-button").hidden = true;

    enemyFormMessage.textContent = "";
});



document.getElementById("world-filter").addEventListener("change", filterEnemies);

document.getElementById("drop-filter").addEventListener("change", filterEnemies);

document.getElementById("phase-filter").addEventListener("change", filterEnemies);

document.getElementById("enemy-search").addEventListener("input", filterEnemies);

document.getElementById("sort-by").addEventListener("change", filterEnemies);

// Clear Filters
document.getElementById("clear-filters-button").addEventListener("click", () => {
    document.getElementById("enemy-search").value = "";
    document.getElementById("world-filter").value = "";
    document.getElementById("drop-filter").value = "";
    document.getElementById("phase-filter").value = "";
    document.getElementById("sort-by").value = "name-asc";

    filterEnemies();
});

checkAdminStatus();