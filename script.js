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
});

function fetchPokemons(type = "") {
  let url = "https://pokeapi.co/api/v2/pokemon?limit=50";
  if (type) {
    url = `https://pokeapi.co/api/v2/type/${type}`;
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const pokemonList = type
        ? data.pokemon.map((p) => p.pokemon)
        : data.results;
      displayPokemon(pokemonList);
    })
    .catch((error) => console.error("Error:", error));
}

function displayPokemon(pokemonList) {
  const pokemonContainer = document.querySelector(".pokemon-container");
  pokemonContainer.innerHTML = "";

  pokemonList.forEach(async (pokemon) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");

    const type = await getPokemonType(pokemon.url);

    pokemonCard.classList.add(`type-${type}`);

    pokemonCard.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
              pokemon.url
            )}.png" alt="${pokemon.name}">
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
