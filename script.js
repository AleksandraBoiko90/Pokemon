document.addEventListener("DOMContentLoaded", function () {
  fetchPokemons();

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", function () {
      const typeClass = Array.from(this.classList).find((cl) =>
        cl.startsWith("type-")
      );
      const type = typeClass.split("-")[1];
      fetchPokemons(type);
    });
  });

  document
    .getElementById("create-pokemon-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      createPokemon();
    });
});

function createPokemon() {
  const pokemon = {
    name: document.getElementById("pokemon-name").value,
    type: document.getElementById("pokemon-type").value,
    imageUrl:
      document.getElementById("pokemon-image").files.length > 0
        ? URL.createObjectURL(document.getElementById("pokemon-image").files[0])
        : "./images/Poké_Ball_icon.svg.png",
  };

  savePokemon(pokemon);
  fetchPokemons();
}

function savePokemon(pokemon) {
  let pokemons = JSON.parse(localStorage.getItem("customPokemons")) || [];
  pokemons.push(pokemon);
  localStorage.setItem("customPokemons", JSON.stringify(pokemons));
}

function fetchPokemons(type = "") {
  let customPokemons = JSON.parse(localStorage.getItem("customPokemons")) || [];
  customPokemons = customPokemons.filter(
    (pokemon) => !type || pokemon.type === type
  );

  let url = "https://pokeapi.co/api/v2/pokemon?limit=50";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const pokemonListFromAPI = data.results;

      const promises = pokemonListFromAPI.map((pokemon) =>
        fetch(pokemon.url).then((resp) => resp.json())
      );

      Promise.all(promises).then((results) => {
        const filteredResults = type
          ? results.filter((pokemon) => pokemon.types[0].type.name === type)
          : results;

        filteredResults.forEach((pokemon) => {
          pokemon.type = pokemon.types[0].type.name;
          pokemon.imageUrl = pokemon.sprites.front_default;
        });

        const allPokemons = [...customPokemons, ...filteredResults];
        displayPokemon(allPokemons);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function displayPokemon(pokemonList, filterType = "") {
  const pokemonContainer = document.querySelector(".pokemon-container");
  pokemonContainer.innerHTML = "";

  pokemonList.forEach((pokemon, index) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");

    let imageUrl = pokemon.imageUrl;
    let type = pokemon.type;

    pokemonCard.innerHTML = `
          <img src="${imageUrl}" alt="${pokemon.name}" style="width:100px;height:100px;">
          <h3>${pokemon.name}</h3>
          <p>Type: ${type}</p>
          <button class="save-button" data-index="${index}">Save</button>
          <button class="delete-button">Delete</button>
          <button class="edit-button">Edit</button>
      `;

    pokemonContainer.appendChild(pokemonCard);
  });

  document.querySelectorAll(".save-button").forEach((button) => {
    button.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      savePokemon(pokemonList[index]);
    });
  });
}

function getPokemonId(url) {
  const parts = url.split("/");

  return parts[parts.length - 2];
}

function getPokemonType(url) {
  return fetch(url)
    .then((response) => response.json())
    .then((data) => data.types[0].type.name)
    .catch((error) => console.error("Error:", error));
}

function savePokemon(pokemon) {
  let pokemons = JSON.parse(localStorage.getItem("customPokemons")) || [];
  if (pokemons.length >= 5) {
    alert(
      "You can't save more than 5 pokemons. Please delete one to save a new one."
    );
    return;
  }
  pokemons.push(pokemon);
  localStorage.setItem("customPokemons", JSON.stringify(pokemons));
  displaySavedPokemons();
}

function displaySavedPokemons() {
  const savedPokemonsContainer = document.querySelector(".saved-pokemons");
  savedPokemonsContainer.innerHTML = "";

  let savedPokemons = JSON.parse(localStorage.getItem("customPokemons")) || [];
  savedPokemons.forEach((pokemon, index) => {
    const pokemonElement = document.createElement("div");
    pokemonElement.classList.add("pokemon-card");
    pokemonElement.innerHTML = `
          <img src="${pokemon.imageUrl}" alt="${pokemon.name}" style="width:100px;height:100px;">
          <h3>${pokemon.name}</h3>
          <p>Type: ${pokemon.type}</p>
      `;

    // Создание кнопки удаления
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteSavedPokemon(index);
    pokemonElement.appendChild(deleteButton);

    savedPokemonsContainer.appendChild(pokemonElement);
  });
}

function deleteSavedPokemon(index) {
  let savedPokemons = JSON.parse(localStorage.getItem("customPokemons")) || [];
  savedPokemons.splice(index, 1);
  localStorage.setItem("customPokemons", JSON.stringify(savedPokemons));
  displaySavedPokemons();
}
