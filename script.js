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
  const name = document.getElementById("pokemon-name").value;
  const type = document.getElementById("pokemon-type").value;
  const pokemon = {
    name,
    type,
    imageUrl: "./images/Poké_Ball_icon.svg.png",
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

        displayPokemon([...customPokemons, ...filteredResults]);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function displayPokemon(pokemonList, filterType = "") {
  const pokemonContainer = document.querySelector(".pokemon-container");
  pokemonContainer.innerHTML = "";

  pokemonList.forEach((pokemon) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("type-filter-button");

    let imageUrl =
      pokemon.imageUrl ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
        pokemon.url
      )}.png`;

    let type = pokemon.type;
    let primaryType = type.split(" ")[0];
    pokemonCard.classList.add(`type-${primaryType}`);

    pokemonCard.innerHTML = `
          <img src="${imageUrl}" alt="${pokemon.name}">
          <h3>${pokemon.name}</h3>
          <p>Type: ${type}</p> 
          <button class="save-button">Save</button>
          <button class="delete-button">Delete</button>
          <button class="edit-button">Edit</button>
      `;

    pokemonContainer.appendChild(pokemonCard);
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
