document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const draftStartOverlay = document.getElementById('draft-start-overlay');
  const startDraftBtn = document.getElementById('start-draft-btn');
  const playersListEl = document.getElementById('players-list');
  const poolListEl = document.getElementById('pool-list');
  const currentPickerEl = document.getElementById('current-picker');
  const currentRoundEl = document.getElementById('current-round');
  const pickNumberEl = document.getElementById('pick-number');
  const timerEl = document.getElementById('timer');
  const progressBarEl = document.getElementById('progress-bar');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const resultsContainer = document.getElementById('results-container');
  const pairingsList = document.getElementById('pairings-list');
  const pairingsText = document.getElementById('pairings-text');
  const copyBtn = document.getElementById('copy-btn');
  const restartBtn = document.getElementById('restart-btn');

  // Players data (from the player list in image)
  const players = [
      { id: 1, name: "Minges", partner: null },
      { id: 2, name: "Joe M", partner: null },
      { id: 3, name: "Joe W", partner: null },
      { id: 4, name: "Lane", partner: null },
      { id: 5, name: "Couch", partner: null },
      { id: 6, name: "Nolan", partner: null },
      { id: 7, name: "Meister", partner: null },
      { id: 8, name: "Merkle", partner: null },
      { id: 9, name: "Randy", partner: null },
      { id: 10, name: "Curry", partner: null },
      { id: 11, name: "Han", partner: null },
      { id: 12, name: "Squeek", partner: null },
      { id: 13, name: "Butters", partner: null },
      { id: 14, name: "Foxx", partner: null },
      { id: 15, name: "Seth", partner: null },
      { id: 16, name: "Dan", partner: null },
      { id: 17, name: "Jarrett", partner: null },
      { id: 18, name: "Chris", partner: null }
  ];

  // Pool players data (from "The Pool" in image)
  const poolPlayers = [
      { id: 19, name: "Jesse" },
      { id: 20, name: "Creelman" },
      { id: 21, name: "Colton" },
      { id: 22, name: "Tony" },
      { id: 23, name: "Houck" },
      { id: 24, name: "Jim" },
      { id: 25, name: "Ray" },
      { id: 26, name: "Miniard" },
      { id: 27, name: "Warman" },
      { id: 28, name: "Noonan" },
      { id: 29, name: "Brandon" },
      { id: 30, name: "Josh" },
      { id: 31, name: "Ben" },
      { id: 32, name: "Waldroff" },
      { id: 33, name: "Jack" },
      { id: 34, name: "Jeff" },
      { id: 35, name: "Trey" },
      { id: 36, name: "Jason" }
  ];

  // Draft state
  let currentPickIndex = 0;
  let selectedPoolPlayerId = null;
  let draftComplete = false;
  let draftHistory = [];
  let isDraftStarted = false;
  let timerInterval = null;
  let timeRemaining = 300; // 5 minutes in seconds

  // Initialize the draft
  function initializeDraft() {
      renderPlayers();
      renderPoolPlayers();
      updateCurrentPicker();
      updateProgressBar();
  }

  // Start the draft
  function startDraft() {
      isDraftStarted = true;
      draftStartOverlay.classList.add('hidden');
      startTimer();
  }

  // Start/reset the timer
  function startTimer() {
      // Clear any existing timer
      if (timerInterval) {
          clearInterval(timerInterval);
      }

      // Reset time to 5 minutes
      timeRemaining = 300;
      updateTimerDisplay();

      // Start new timer
      timerInterval = setInterval(function() {
          timeRemaining--;

          if (timeRemaining <= 0) {
              clearInterval(timerInterval);
              timeRemaining = 0;
              // Could add auto-skip or alert here
          }

          updateTimerDisplay();
      }, 1000);
  }

  // Update the timer display
  function updateTimerDisplay() {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;

      timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Change timer color based on time remaining
      timerEl.classList.remove('warning', 'danger');

      if (timeRemaining <= 60) {
          timerEl.classList.add('danger');
      } else if (timeRemaining <= 120) {
          timerEl.classList.add('warning');
      }
  }

  // Render the players list
  function renderPlayers() {
      playersListEl.innerHTML = '';
      players.forEach(player => {
          const isCurrentPicker = players[currentPickIndex]?.id === player.id;
          const playerCard = document.createElement('div');
          playerCard.className = `player-card ${isCurrentPicker ? 'current' : ''}`;

          // Add extra class if player has partner
          if (player.partner) {
              playerCard.classList.add('with-partner');
          }

          // Mark double-digit numbers
          const isDoubleDigit = player.id >= 10;
          playerCard.dataset.doubleDigit = isDoubleDigit;

          // Create player number separately to style it directly
          const playerNumber = document.createElement('div');
          playerNumber.className = 'player-number';
          playerNumber.textContent = player.id;

          // Create player name and partner info
          const playerInfo = document.createElement('div');
          playerInfo.className = 'player-info';

          // Create player name div
          const playerName = document.createElement('div');
          playerName.className = 'player-name';
          playerName.textContent = player.name;

          // Add name to player info
          playerInfo.appendChild(playerName);

          // Add partner info if exists
          if (player.partner) {
              const playerPartner = document.createElement('div');
              playerPartner.className = 'player-partner';
              playerPartner.textContent = player.partner.name;
              playerInfo.appendChild(playerPartner);
          }

          // Append elements to the card
          playerCard.appendChild(playerNumber);
          playerCard.appendChild(playerInfo);

          playersListEl.appendChild(playerCard);
      });
  }

  // Render the pool players
  function renderPoolPlayers() {
      poolListEl.innerHTML = '';

      // Only show pool players that haven't been selected
      const availablePoolPlayers = poolPlayers.filter(player =>
          !players.some(p => p.partner && p.partner.id === player.id)
      );

      availablePoolPlayers.forEach(player => {
          const playerCard = document.createElement('div');
          playerCard.className = `player-card pool-player ${selectedPoolPlayerId === player.id ? 'selected' : ''}`;
          playerCard.dataset.id = player.id;

          // Mark double-digit numbers
          const isDoubleDigit = player.id >= 10;
          playerCard.dataset.doubleDigit = isDoubleDigit;

          // Create player number separately to style it directly
          const playerNumber = document.createElement('div');
          playerNumber.className = 'player-number';
          playerNumber.textContent = player.id;

          // Create player info container
          const playerInfo = document.createElement('div');
          playerInfo.className = 'player-info';

          // Create player name
          const playerName = document.createElement('div');
          playerName.className = 'player-name';
          playerName.textContent = player.name;

          // Add name to player info
          playerInfo.appendChild(playerName);

          // Append elements to the card
          playerCard.appendChild(playerNumber);
          playerCard.appendChild(playerInfo);

          playerCard.addEventListener('click', () => {
              selectPoolPlayer(player.id);
          });

          poolListEl.appendChild(playerCard);
      });
  }

  // Select a pool player
  function selectPoolPlayer(id) {
      // Toggle selection if clicking the same player
      if (selectedPoolPlayerId === id) {
          selectedPoolPlayerId = null;
          nextBtn.disabled = true;
      } else {
          selectedPoolPlayerId = id;
          nextBtn.disabled = false;
      }

      // Clear previous selections
      const allPoolCards = document.querySelectorAll('.pool-player');
      allPoolCards.forEach(card => {
          card.classList.remove('selected');
          // Reset to default styling
          card.style.borderColor = '#2d7a3e'; // green-dark
          card.style.boxShadow = 'none';
          card.style.backgroundColor = 'rgba(59, 145, 80, 0.1)';
      });

      // Add selected class and apply styling directly to the current selection
      if (selectedPoolPlayerId !== null) {
          const selectedCard = document.querySelector(`.pool-player[data-id="${selectedPoolPlayerId}"]`);
          if (selectedCard) {
              selectedCard.classList.add('selected');
              // Apply yellow highlight styling directly
              selectedCard.style.borderColor = '#ffd700'; // yellow
              selectedCard.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.6)';
              selectedCard.style.backgroundColor = 'rgba(59, 145, 80, 0.2)';
          }
      }
  }

  // Update the current picker display
  function updateCurrentPicker() {
      if (draftComplete) {
          currentPickerEl.textContent = "Draft Complete";
          currentRoundEl.textContent = "18";
          pickNumberEl.textContent = "18";
          return;
      }

      const currentPlayer = players[currentPickIndex];
      currentPickerEl.textContent = currentPlayer.name;
      currentRoundEl.textContent = (currentPickIndex + 1).toString();
      pickNumberEl.textContent = (currentPickIndex + 1).toString();
  }

  // Update the progress bar
  function updateProgressBar() {
      const progress = ((currentPickIndex) / players.length) * 100;
      progressBarEl.style.width = `${progress}%`;
  }

  // Move to the next pick
  function nextPick() {
      if (selectedPoolPlayerId === null) return;

      const currentPlayer = players[currentPickIndex];
      const selectedPoolPlayer = poolPlayers.find(p => p.id === selectedPoolPlayerId);

      // Save to history for undo functionality
      draftHistory.push({
          playerIndex: currentPickIndex,
          playerId: currentPlayer.id,
          poolPlayerId: selectedPoolPlayerId
      });

      // Assign the partner
      currentPlayer.partner = selectedPoolPlayer;

      // Move to next player
      currentPickIndex++;
      selectedPoolPlayerId = null;
      nextBtn.disabled = true;
      prevBtn.disabled = false;

      // Check if draft is complete BEFORE starting a new timer
      if (currentPickIndex >= players.length) {
          draftComplete = true;
          if (timerInterval) {
              clearInterval(timerInterval);
          }
          showResults();
          return; // Add return to prevent further processing
      }

      // Only start a new timer if the draft isn't complete
      startTimer();

      // Update UI
      renderPlayers();
      renderPoolPlayers();
      updateCurrentPicker();
      updateProgressBar();
  }

  // Go back to the previous pick
  function previousPick() {
      if (draftHistory.length === 0) return;

      // Get the last pick
      const lastPick = draftHistory.pop();

      // Undo the partner assignment
      const player = players.find(p => p.id === lastPick.playerId);
      player.partner = null;

      // Move back to the previous picker
      currentPickIndex = lastPick.playerIndex;
      selectedPoolPlayerId = null;

      if (draftHistory.length === 0) {
          prevBtn.disabled = true;
      }

      if (draftComplete) {
          draftComplete = false;
          resultsContainer.classList.add('hidden');
      }

      // Restart timer
      startTimer();

      renderPlayers();
      renderPoolPlayers();
      updateCurrentPicker();
      updateProgressBar();
      nextBtn.disabled = true;
  }

  // Show draft results
  function showResults() {
      resultsContainer.classList.remove('hidden');

      // Display pairings in the list
      pairingsList.innerHTML = '';
      let pairingsTextContent = '2025 Rising Star Classic Pairings:\n\n';

      players.forEach(player => {
          const pairingDiv = document.createElement('div');
          pairingDiv.innerHTML = `<span class="pairing-highlight">${player.name}</span> is paired with <span class="pairing-highlight">${player.partner.name}</span>`;
          pairingsList.appendChild(pairingDiv);

          pairingsTextContent += `${player.name} - ${player.partner.name}\n`;
      });

      pairingsText.value = pairingsTextContent;
  }

  // Copy to clipboard functionality
  function copyToClipboard() {
      pairingsText.select();
      document.execCommand('copy');

      // Visual feedback
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
          copyBtn.textContent = 'Copy to Clipboard';
      }, 2000);
  }

  // Restart draft
  function restartDraft() {
      // Reset all player partners
      players.forEach(player => {
          player.partner = null;
      });

      // Reset draft state
      currentPickIndex = 0;
      selectedPoolPlayerId = null;
      draftComplete = false;
      draftHistory = [];

      // Hide results and show draft interface
      resultsContainer.classList.add('hidden');
      draftStartOverlay.classList.remove('hidden');

      // Reset UI
      if (timerInterval) {
          clearInterval(timerInterval);
      }

      renderPlayers();
      renderPoolPlayers();
      updateCurrentPicker();
      updateProgressBar();

      nextBtn.disabled = true;
      prevBtn.disabled = true;

      isDraftStarted = false;
  }

  // Event listeners
  startDraftBtn.addEventListener('click', startDraft);
  nextBtn.addEventListener('click', nextPick);
  prevBtn.addEventListener('click', previousPick);
  copyBtn.addEventListener('click', copyToClipboard);
  restartBtn.addEventListener('click', restartDraft);

  // Initialize
  initializeDraft();
});