document.addEventListener('DOMContentLoaded', function() {

  const pokemons = fetch('https://pokeapi.co/api/v2/pokemon?limit=50')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {

          displayPokemon(data.results);
      })
      .catch(error => {

          console.error('Error:', error);
      });
});

function displayPokemon(pokemonList) {
const pokemonContainer = document.querySelector('.pokemon-container');

pokemonContainer.innerHTML = '';

pokemonList.forEach(async pokemon => { 
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');


    const type = await getPokemonType(pokemon.url);
    pokemonCard.innerHTML = `
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(pokemon.url)}.png" alt="${pokemon.name}">
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

  const parts = url.split('/');

  return parts[parts.length - 2];
}



function getPokemonType(url) {

  return fetch(url)
    .then(response => response.json())
    .then(data => data.types[0].type.name)
    .catch(error => console.error('Error:', error));
}
