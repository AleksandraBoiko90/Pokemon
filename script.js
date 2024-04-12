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
  // Retrieve values from the form fields
  const name = document.getElementById('pokemon-name').value;
  const type = document.getElementById('pokemon-type').value;
  const imageFileInput = document.getElementById('pokemon-image');
  const hp = parseInt(document.getElementById('pokemon-hp').value);
  const attack = parseInt(document.getElementById('pokemon-attack').value);

  // Check if all required fields are filled
  if (!name || !type || isNaN(hp) || isNaN(attack)) {
      alert('Please fill in all fields.');
      return;
  }

  // Check if an image file is selected
  let imageUrl = './images/Poké_Ball_icon.svg.png'; // Default image URL
  if (imageFileInput.files && imageFileInput.files.length > 0) {
      // Get the first selected image file
      const imageFile = imageFileInput.files[0];

      // Check if the selected file is an image
      if (!imageFile.type.startsWith('image/')) {
          alert('Please select an image file.');
          return;
      }

      // Read the selected image file as a data URL
      const reader = new FileReader();
      reader.onload = function(event) {
          imageUrl = event.target.result;

          // Create the Pokemon object
          const pokemon = {
              name: name,
              type: type,
              imageUrl: imageUrl,
              hp: hp,
              attack: attack
          };

          // Add the Pokemon to the list and save it
          addPokemonToList(pokemon);

          // Display the updated list of saved Pokemons
          displaySavedPokemons(getCurrentFilterType());

          // Clear the form fields
          document.getElementById('create-pokemon-form').reset();

          // Log the created Pokemon for debugging
          console.log("Pokemon created:", pokemon);
      };
      reader.readAsDataURL(imageFile);
  } else {
      // Create the Pokemon object with default image URL
      const pokemon = {
          name: name,
          type: type,
          imageUrl: imageUrl,
          hp: hp,
          attack: attack
      };

      // Add the Pokemon to the list and save it
      addPokemonToList(pokemon);

      // Display the updated list of saved Pokemons
      displaySavedPokemons(getCurrentFilterType());

      // Clear the form fields
      document.getElementById('create-pokemon-form').reset();

      // Log the created Pokemon for debugging
      console.log("Pokemon created:", pokemon);
  }
}


function getCurrentFilterType() {
  const activeFilter = document.querySelector('.filter-button.active');
  return activeFilter ? activeFilter.dataset.type : '';
}


function getTypeColor(type) {
  const typeColors = {
      fire: '#ffa56d',
      water: '#DEF3FD',
      grass: '#DEFDE0',
      electric: '#FCF7DE',
      ground: '#f4e7da',
      rock: '#d5d5d4',
      fairy: '#fceaff',
      poison: '#cf9cd6',
      bug: '#f8d5a3',
      dragon: '#ffcaa5',
      psychic: '#eaeda1',
      flying: '##ffe1a5',
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
          console.log("Полученные данные о покемонах:", results);

          const filteredResults = results.map(pokemon => {
              return {
                  name: pokemon.name,
                  type: pokemon.types[0].type.name,
                  imageUrl: pokemon.sprites.front_default,
                  hp: getStat(pokemon.stats, "hp"),
                  attack: getStat(pokemon.stats, "attack")
              };
          });



          savePokemonFromAPI(filteredResults);
         

          displayPokemon(filteredResults, type);
          });
          
      })
      .catch(error => console.error('Error:', error));
}

function getStat(stats, statName) {
  const stat = stats.find(s => s.stat.name === statName);
  return stat ? stat.base_stat : null;
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



function savePokemonFromAPI(pokemonList) {
  localStorage.setItem('allPokemons', JSON.stringify(pokemonList));
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
      <p>Health: <span class="health">${pokemon.hp}</span></p>
          <p>Attack: <span class="attack">${pokemon.attack}</span></p>
      <button class="save-button" data-index="${index}">Save</button>
      <button class="delete-button" data-index="${index}">Delete</button>
      <button class="edit-button" data-index="${index}">Edit</button>
  `;

  return pokemonCard;
}


function deletePokemonFromList(index, allPokemons) {
  allPokemons.splice(index, 1);
  localStorage.setItem('myPokemons', JSON.stringify(allPokemons));
}

function attachDeleteEventHandlers(allPokemons) {
  // Attach event handlers for delete, edit, and save buttons
  document.querySelectorAll('.delete-button').forEach((button, index) => {
      button.addEventListener('click', function () {
          const pokemonIndex = parseInt(this.parentElement.querySelector('.save-button').getAttribute('data-index'));
          deletePokemonFromList(pokemonIndex, allPokemons);
          this.parentElement.remove();
      });
  });

  document.querySelectorAll('.edit-button').forEach(button => {
      button.addEventListener('click', function () {
          const index = parseInt(this.getAttribute('data-index'));
          const isCustom = this.parentElement.classList.contains('pokemon-card'); // Проверяем, является ли покемон собственным
          const pokemon = isCustom ? getAllPokemons()[index] : JSON.parse(localStorage.getItem('allPokemons'))[index];
          openEditForm(pokemon, index, isCustom); // Pass the selected Pokemon, its index, and its type to the edit form function
      });
  });
  
  document.querySelectorAll('.save-button').forEach(button => {
      button.addEventListener('click', function () {
          const index = parseInt(this.getAttribute('data-index'));
          savePokemon(allPokemons[index]); // Pass the correct Pokemon data to the save function
      });
  });
}

function openEditForm(pokemon, index, isCustom) {
  const editForm = document.getElementById('edit-pokemon-form');
  editForm.classList.remove('hidden');
  
  // Проверяем, что объект pokemon определен и не является undefined
  if (pokemon) {
      // Заполняем форму редактирования данными выбранного покемона
      document.getElementById('edit-pokemon-name').value = pokemon.name || '';
      document.getElementById('edit-pokemon-type').value = pokemon.type || '';
      document.getElementById('edit-pokemon-hp').value = pokemon.hp || '';
      document.getElementById('edit-pokemon-attack').value = pokemon.attack || '';

      // Добавляем обработчик события для кнопки сохранения в форме редактирования
      document.getElementById('save-edited-pokemon').addEventListener('click', function () {
          saveEditedPokemon(index, isCustom);
      });
  } else {
      // Выводим сообщение об ошибке, если объект pokemon не определен
      console.error('Pokemon data is undefined.');
      // Можно также добавить дополнительные действия, например, скрыть форму редактирования
  }
}

function saveEditedPokemon(index, isCustom) {
  const editedPokemon = {
      name: document.getElementById('edit-pokemon-name').value,
      type: document.getElementById('edit-pokemon-type').value,
      imageUrl: document.getElementById('edit-pokemon-image').value,
      hp: parseInt(document.getElementById('edit-pokemon-hp').value),
      attack: parseInt(document.getElementById('edit-pokemon-attack').value)
  };

  if (isCustom) {
      updatePokemonInList(index, editedPokemon);
  } else {
      updateGeneralPokemonInList(index, editedPokemon);
  }
  closeEditForm();
  displaySavedPokemons(); // Обновление списка сохраненных покемонов после редактирования
}

function closeEditForm() {
  const editForm = document.getElementById('edit-pokemon-form');
  editForm.classList.add('hidden');
}

function updatePokemonInList(index, editedPokemon) {
  let allPokemons = getAllPokemons();
  allPokemons[index] = editedPokemon;
  localStorage.setItem('myPokemons', JSON.stringify(allPokemons));
  displaySavedPokemons(getCurrentFilterType());
}


function updateGeneralPokemonInList(index, editedPokemon) {
  let allPokemons = JSON.parse(localStorage.getItem('allPokemons'));
  allPokemons[index] = editedPokemon;
  localStorage.setItem('allPokemons', JSON.stringify(allPokemons));
  displaySavedPokemons(getCurrentFilterType());
}


function deleteSavedPokemon(index, filterType = '') {
  let savedPokemons = JSON.parse(localStorage.getItem('customPokemons')) || [];
  savedPokemons.splice(index, 1);
  localStorage.setItem('customPokemons', JSON.stringify(savedPokemons));
  displaySavedPokemons(filterType); // Обновляем отображение сохраненных покемонов
}

function getAllPokemons() {
  return JSON.parse(localStorage.getItem('myPokemons')) || [];
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

  // Check if the Pokémon already exists in the savedPokemons list
  const pokemonExists = savedPokemons.some(savedPokemon => 
      savedPokemon.name === pokemon.name && savedPokemon.type === pokemon.type
  );

  if (pokemonExists) {
      alert('This pokemon is already in your saved list.');
      return;
  }

  // Limiting the number of saved Pokémon to 5
  if (savedPokemons.length >= 5) {
      alert("You can't save more than 5 pokemons. Please delete one to save a new one.");
      return;
  }

  // Add the new Pokémon if not already present
  savedPokemons.push(pokemon);
  localStorage.setItem('customPokemons', JSON.stringify(savedPokemons));
  displaySavedPokemons(); // Update the list of saved Pokémon
}
document.getElementById('prepare-battle').addEventListener('click', prepareBattle);

function prepareBattle() {
  const myTeam = getSavedPokemons();  
  const opponentTeam = getRandomOpponentPokemons();  
  Promise.all([myTeam, opponentTeam]).then(values => {
      const [myTeamPokemons, opponentPokemons] = values;
      startBattle(myTeamPokemons, opponentPokemons);
  }).catch(error => {
      console.error('Ошибка при подготовке к битве:', error);
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
  const maxOffset = 50;  
  const offset = Math.floor(Math.random() * (maxOffset + 1)); 
  let url = `https://pokeapi.co/api/v2/pokemon?limit=3&offset=${offset}`;

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
      pokemonElement.innerHTML = `
          <h3>${pokemon.name}</h3>
          <img src="${pokemon.imageUrl || pokemon.sprites.front_default}" alt="${pokemon.name}" style="width:100px;height:100px;">
          <p>Health: <span class="health">${pokemon.hp || pokemon.stats[0].base_stat}</span></p>
          <p>Attack: <span class="attack">${pokemon.attack || pokemon.stats[1].base_stat}</span></p>
      `;

      
      pokemonElement.setAttribute('data-hp', pokemon.hp || pokemon.stats[0].base_stat);
      pokemonElement.setAttribute('data-attack', pokemon.attack || pokemon.stats[1].base_stat);

      
      container.appendChild(pokemonElement);
  });
}


document.getElementById('attack').addEventListener('click', performAttack);


function performAttack() {
  let myTeam = Array.from(document.querySelectorAll('#my-team div'));
  let opponentTeam = Array.from(document.querySelectorAll('#opponent-team div'));

  if (opponentTeam.length > 0 && myTeam.length > 0) {

      let randomMyIndex = Math.floor(Math.random() * myTeam.length);
      let myPokemon = myTeam[randomMyIndex];

      let attackElement = myPokemon.querySelector('.attack');
      if (!attackElement) {
          console.error('Attack element not found');
          return;
      }
      let attackValue = parseInt(attackElement.textContent);


      let randomOpponentIndex = Math.floor(Math.random() * opponentTeam.length);
      let opponentPokemon = opponentTeam[randomOpponentIndex];

      let opponentHealthElement = opponentPokemon.querySelector('.health');
      if (!opponentHealthElement) {
          console.error('Health element not found');
          return;
      }
      let opponentHealth = parseInt(opponentHealthElement.textContent);

      opponentHealth -= attackValue;

      if (opponentHealth > 0) {
          opponentHealthElement.textContent = opponentHealth;
          alert(`Your ${myPokemon.querySelector('h3').textContent} attacked ${opponentPokemon.querySelector('h3').textContent} and dealt ${attackValue} damage!`);

          setTimeout(() => {
              performOpponentAttack(opponentTeam[Math.floor(Math.random() * opponentTeam.length)], myTeam);
          }, 500);
      } else {
          opponentPokemon.remove();
          alert(`Your ${myPokemon.querySelector('h3').textContent} defeated ${opponentPokemon.querySelector('h3').textContent}!`);
          checkBattleEnd();
      }
  }
}



function performOpponentAttack(opponentPokemon, myTeam) {
  let attackElement = opponentPokemon.querySelector('.attack');
  if (!attackElement) {
      console.error('Opponent attack element not found');
      return;
  }
  let attackValue = parseInt(attackElement.textContent);

  if (myTeam.length === 0) {
      console.error("No available Pokémon for opponent to attack.");
      return;
  }


  let randomIndex = Math.floor(Math.random() * myTeam.length);
  let myPokemon = myTeam[randomIndex];
  let myHealthElement = myPokemon.querySelector('.health');
  if (!myHealthElement) {
      console.error('My Pokémon health element not found');
      return;
  }
  let myHealth = parseInt(myHealthElement.textContent);

  myHealth -= attackValue;

  if (myHealth > 0) {
      myHealthElement.textContent = myHealth;
      alert(`Opponent's ${opponentPokemon.querySelector('h3').textContent} attacked your ${myPokemon.querySelector('h3').textContent} and dealt ${attackValue} damage!`);
  } else {
      myPokemon.remove();
      alert(`Opponent's ${opponentPokemon.querySelector('h3').textContent} defeated your ${myPokemon.querySelector('h3').textContent}!`);
      checkBattleEnd();
  }
}

function checkBattleEnd() {
  if (document.querySelectorAll('#my-team div').length === 0) {
      alert('You lost the battle!');
      document.getElementById('battle-area').classList.add('hidden');
      document.getElementById('battle-setup').classList.remove('hidden');
  } else if (document.querySelectorAll('#opponent-team div').length === 0) {
      alert('You won the battle!');
      document.getElementById('battle-area').classList.add('hidden');
      document.getElementById('battle-setup').classList.remove('hidden');
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

