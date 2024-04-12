document.addEventListener('DOMContentLoaded', function () {
  fetchPokemons();
  displaySavedPokemons();

  document.querySelectorAll('.filter-button').forEach(button => {
      button.addEventListener('click', function () {
          const typeClass = Array.from(this.classList).find(cl => cl.startsWith('type-'));
          const type = typeClass.split('-')[1];
          fetchPokemons(type);
      });
  });

  document.getElementById('create-pokemon-form').addEventListener('submit', function (e) {
      e.preventDefault();
      createPokemon();
  });

  const toggleButton = document.getElementById('toggle-saved-pokemons');
  const savedPokemonsContainer = document.getElementById('saved-pokemons-container');

  toggleButton.addEventListener('click', function () {
      savedPokemonsContainer.classList.toggle('hidden');
  });
});

function createPokemon() {
  const pokemon = {
      name: document.getElementById('pokemon-name').value,
      type: document.getElementById('pokemon-type').value,
      imageUrl: document.getElementById('pokemon-image').files.length > 0
          ? URL.createObjectURL(document.getElementById('pokemon-image').files[0])
          : './images/Poké_Ball_icon.svg.png'
  };

  addPokemonToList(pokemon);
  console.log("Pokemon created:", pokemon);
  const currentFilterType = getCurrentFilterType();
  displaySavedPokemons(currentFilterType);
  fetchPokemons(currentFilterType);
  displayPokemon([], currentFilterType);
}


function getCurrentFilterType() {
  const activeFilter = document.querySelector('.filter-button.active');
  return activeFilter ? activeFilter.dataset.type : '';
}


function getTypeColor(type) {
  const typeColors = {
      fire: '#FDDFDF',
      water: '#DEF3FD',
      grass: '#DEFDE0',
      electric: '#FCF7DE',
      ground: '#f4e7da',
      rock: '#d5d5d4',
      fairy: '#fceaff',
      poison: '#9999',
      bug: '#f8d5a3',
      dragon: '#97b3e6',
      psychic: '#eaeda1',
      flying: '#F5F5F5',
      fighting: '#E6E0D4',
      normal: '#F5F5F5'
  };
  return typeColors[type.toLowerCase()] || '#F5F5F5';
}

function addPokemonToList(pokemon) {
  let myPokemons = JSON.parse(localStorage.getItem('myPokemons')) || [];
  myPokemons.push(pokemon);
  localStorage.setItem('myPokemons', JSON.stringify(myPokemons));
}

function fetchPokemons(type = '') {
  let url = 'https://pokeapi.co/api/v2/pokemon?limit=50';
  fetch(url)
      .then(response => response.json())
      .then(data => {
          const pokemonListFromAPI = data.results;

          const promises = pokemonListFromAPI.map(pokemon =>
              fetch(pokemon.url).then(resp => resp.json())
          );

          Promise.all(promises).then(results => {

              const filteredResults = results.filter(pokemon => {
                  return !type || (pokemon.types[0].type.name === type);
              });

              filteredResults.forEach(pokemon => {
                  pokemon.type = pokemon.types[0].type.name;
                  pokemon.imageUrl = pokemon.sprites.front_default;
              });

              displayPokemon(filteredResults, type);
          });

      })
      .catch(error => console.error('Error:', error));
}


function displayPokemon(pokemonList, filterType = '') {
  const pokemonContainer = document.querySelector('.pokemon-container');
  pokemonContainer.innerHTML = '';

  let allPokemons = [].concat(
      JSON.parse(localStorage.getItem('myPokemons')) || [],
      JSON.parse(localStorage.getItem('customPokemons')) || [],
      pokemonList
  ).filter(pokemon => !filterType || pokemon.type === filterType);

  allPokemons.forEach((pokemon, index) => {
      const pokemonCard = createPokemonCard(pokemon, index);
      pokemonContainer.appendChild(pokemonCard);
  });

  attachDeleteEventHandlers(allPokemons);
}


function createPokemonCard(pokemon, index) {
  const pokemonCard = document.createElement('div');
  pokemonCard.classList.add('pokemon-card');
  pokemonCard.style.backgroundColor = getTypeColor(pokemon.type);

  let imageUrl = pokemon.imageUrl;
  let type = pokemon.type;

  pokemonCard.innerHTML = `
      <img src="${imageUrl}" alt="${pokemon.name}" style="width:100px;height:100px;">
      <h3>${pokemon.name}</h3>
      <p>Type: ${type}</p>
      <button class="save-button" data-index="${index}">Save</button>
      <button class="delete-button" data-index="${index}">Delete</button>
      <button class="edit-button" data-index="${index}">Edit</button>
  `;

  return pokemonCard;
}


function attachDeleteEventHandlers(allPokemons) {
  document.querySelectorAll('.delete-button').forEach((button, index) => {
      button.addEventListener('click', function () {
          const pokemonIndex = parseInt(this.parentElement.querySelector('.save-button').getAttribute('data-index'));
          deletePokemonFromList(pokemonIndex);
          this.parentElement.remove();
      });
  });

  document.querySelectorAll('.save-button').forEach(button => {
      button.addEventListener('click', function () {
          const index = parseInt(this.getAttribute('data-index'));
          savePokemon(allPokemons[index]);
      });
  });
}

function deletePokemonFromList(index) {
  let myPokemons = JSON.parse(localStorage.getItem('myPokemons')) || [];
  myPokemons.splice(index, 1);
  localStorage.setItem('myPokemons', JSON.stringify(myPokemons));
}

function displaySavedPokemons(filterType = '') {
  const savedPokemonsContainer = document.querySelector('.saved-pokemons');
  savedPokemonsContainer.innerHTML = '';

  let savedPokemons = JSON.parse(localStorage.getItem('customPokemons')) || [];
  savedPokemons = savedPokemons.filter(pokemon => !filterType || pokemon.type === filterType);

  savedPokemons.forEach((pokemon, index) => {
      const pokemonCard = createPokemonCard(pokemon, index);
      savedPokemonsContainer.appendChild(pokemonCard);
  });

  attachDeleteEventHandlersForSavedPokemons();
}


function attachDeleteEventHandlersForSavedPokemons() {
  document.querySelectorAll('.saved-pokemons .delete-button').forEach(button => {
      button.addEventListener('click', function () {
          const index = parseInt(this.getAttribute('data-index'));
          deleteSavedPokemon(index);
          this.parentElement.remove();
      });
  });
}

function deleteSavedPokemon(index, filterType = '') {
  let savedPokemons = JSON.parse(localStorage.getItem('customPokemons')) || [];
  savedPokemons.splice(index, 1);
  localStorage.setItem('customPokemons', JSON.stringify(savedPokemons));
  displaySavedPokemons(filterType);
}

function savePokemon(pokemon) {
  let savedPokemons = JSON.parse(localStorage.getItem('customPokemons')) || [];
  console.log("Сохраняемые покемоны до добавления:", savedPokemons);

  const pokemonExists = savedPokemons.some(savedPokemon => savedPokemon.name === pokemon.name && savedPokemon.type === pokemon.type);
  console.log("Покемон уже существует:", pokemonExists);

  if (pokemonExists) {
      alert('This pokemon is already in your saved list.');
      return;
  }

  if (savedPokemons.length >= 5) {
      alert("You can't save more than 5 pokemons. Please delete one to save a new one.");
      return;
  }

  savedPokemons.push(pokemon);
  console.log("Добавлен новый покемон:", pokemon);
  localStorage.setItem('customPokemons', JSON.stringify(savedPokemons));
  displaySavedPokemons();
}








document.getElementById('prepare-battle').addEventListener('click', prepareBattle);

function prepareBattle() {
  const myTeam = getSavedPokemons(); 
  const opponentTeam = getRandomOpponentPokemons();  
  Promise.all([myTeam, opponentTeam]).then(values => {
      startBattle(values[0], values[1]);
  });
}

function getSavedPokemons() {
  return new Promise(resolve => {
      const savedPokemons = JSON.parse(localStorage.getItem('customPokemons') || '[]');
      if (savedPokemons.length < 3) {
          alert("Недостаточно покемонов для битвы. Сохраните минимум 3 покемона.");
          resolve([]);
      } else {
          resolve(savedPokemons.slice(0, 3));
      }
  });
}

function getRandomOpponentPokemons() {
  let url = 'https://pokeapi.co/api/v2/pokemon?limit=3';
  return fetch(url)
      .then(response => response.json())
      .then(data => {
          const pokemonUrls = data.results.map(pokemon => pokemon.url);
          const pokemonPromises = pokemonUrls.map(url => fetch(url).then(resp => resp.json()));
          return Promise.all(pokemonPromises);
      });
}

function startBattle(myTeam, opponentTeam) {

  document.getElementById('battle-setup').classList.add('hidden');
  document.getElementById('battle-area').classList.remove('hidden');
  displayPokemons(myTeam, 'my-team');
  displayPokemons(opponentTeam, 'opponent-team');
}

function displayPokemons(pokemons, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  pokemons.forEach(pokemon => {
      const pokemonElement = document.createElement('div');
      pokemonElement.innerHTML = `<h3>${pokemon.name}</h3><img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" style="width:100px;height:100px;">`;
      container.appendChild(pokemonElement);
  });
}


document.getElementById('attack').addEventListener('click', performAttack);

function performAttack() {

  console.log('Attack performed!');


  let opponentPokemons = document.querySelectorAll('#opponent-team div');
  let myPokemons = document.querySelectorAll('#my-team div');


  if (opponentPokemons.length > 0) {
      opponentPokemons[0].remove(); 
      console.log('Opponent Pokémon defeated!');


      if (document.querySelectorAll('#opponent-team div').length === 0) {
          alert('You won the battle!');
          document.getElementById('battle-area').classList.add('hidden');  
          document.getElementById('battle-setup').classList.remove('hidden');  
      }
  }
}

function updateHealth(pokemonElement, damage) {

  let health = parseInt(pokemonElement.getAttribute('data-health')) - damage;
  pokemonElement.setAttribute('data-health', health);
  pokemonElement.querySelector('.health').textContent = 'Health: ' + health;

  if (health <= 0) {
      pokemonElement.remove();  
  }
}

