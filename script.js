// Initialization
const dailyLeaderboard = JSON.parse(localStorage.getItem('dailyLeaderboard')) || [];

// Carbon footprint calculation
function calculateFootprint() {
    const milesDriven = parseFloat(document.getElementById('milesDriven').value);
    const mpg = parseFloat(document.getElementById('mpg').value);
    const waterUsed = parseFloat(document.getElementById('waterUsed').value);
    const naturalGas = parseFloat(document.getElementById('naturalGas').value);
    const electricityUsed = parseFloat(document.getElementById('electricityUsed').value);
    
    const carCO2 = 8.8 / mpg * milesDriven;
    const waterCO2 = waterUsed * 0.001;
    const naturalGasCO2 = naturalGas * 0.025;
    const electricityCO2 = electricityUsed * 0.4;

    return carCO2 + waterCO2 + naturalGasCO2 + electricityCO2;
}

async function sendDataToServer(username, totalCO2) {
    try {
        const response = await fetch('/submit-data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, emission: totalCO2})
        });

        if (!response.ok) alert("Failed to submit data to the server.");
    } catch (error) {
        alert("There was an error: " + error);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const totalCO2 = calculateFootprint();
    const username = document.getElementById('username').value;
    const currentDate = new Date().toISOString();

    await sendDataToServer(username, totalCO2);

    const userData = {user: username, dailyEmission: totalCO2, date: currentDate};
    dailyLeaderboard.push(userData);

    localStorage.setItem('dailyLeaderboard', JSON.stringify(dailyLeaderboard));

    document.getElementById('result').textContent = `Total CO2 Emission: ${totalCO2.toFixed(2)} units`;

    displayLeaderboard('daily');
}

function displayLeaderboard(type) {
    const leaderboardData = dailyLeaderboard;
    const leaderboardContainer = document.getElementById(`${type}Data`);

    const sortedLeaderboard = leaderboardData
        .sort((a, b) => a.dailyEmission - b.dailyEmission)
        .slice(0, 10);

    let leaderboardHTML = "";
    if (sortedLeaderboard.length === 0) {
        leaderboardContainer.innerHTML = "<tr><td colspan='4'>No data available</td></tr>";
        return;
    }

    sortedLeaderboard.forEach((entry, index) => {
        const date = new Date(entry.date);
        leaderboardHTML += `<tr><td>${index + 1}</td><td>${entry.user}</td><td>${entry.dailyEmission.toFixed(2)}</td><td>${date.toLocaleString()}</td></tr>`;
    });

    leaderboardContainer.innerHTML = leaderboardHTML;
    document.getElementById('dailyLeaderboard').style.display = 'block';
}

function showDaily() {
    displayLeaderboard('daily');
}

async function fetchLeaderboardData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return [];
    }
}

window.onload = function() {
    displayLeaderboard('daily');
}
