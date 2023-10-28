// Initialization
const dailyLeaderboard = JSON.parse(localStorage.getItem('dailyLeaderboard')) || [];
const monthlyLeaderboard = JSON.parse(localStorage.getItem('monthlyLeaderboard')) || [];

// Carbon footprint calculation
function calculateFootprint() {
    const milesDriven = parseFloat(document.getElementById('milesDriven').value);
    const mpg = parseFloat(document.getElementById('mpg').value);
    const waterUsed = parseFloat(document.getElementById('waterUsed').value);
    const naturalGas = parseFloat(document.getElementById('naturalGas').value);
    const electricityUsed = parseFloat(document.getElementById('electricityUsed').value);
    
    const carCO2 = 8.8 / mpg * milesDriven;
    const waterCO2 = waterUsed * 0.001;
    const naturalGasCO2 = naturalGas * 0.025; // ccf * .025
    const electricityCO2 = electricityUsed * 0.4; // kWh * .4

    const totalCO2 = carCO2 + waterCO2 + naturalGasCO2 + electricityCO2;
    
    return totalCO2;
}

async function sendDataToServer(username, totalCO2) {
    let data = {
        username: username,
        emission: totalCO2
    };

    try {
        let response = await fetch('/submit-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            alert("Failed to submit data to the server.");
        }

    } catch (error) {
        alert("There was an error: " + error);
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault(); // This prevents the form from submitting

    const totalCO2 = calculateFootprint();
    const username = document.getElementById('username').value;

    // Send data to the server
    await sendDataToServer(username, totalCO2);

    // Local leaderboards update
    const userData = {
        user: username,
        dailyEmission: totalCO2
    };

    dailyLeaderboard.push(userData);
    monthlyLeaderboard.push(userData);
    
    localStorage.setItem('dailyLeaderboard', JSON.stringify(dailyLeaderboard));
    localStorage.setItem('monthlyLeaderboard', JSON.stringify(monthlyLeaderboard));

    // Displaying the CO2 emission result on the page
    const resultDiv = document.getElementById('result'); 
    resultDiv.textContent = `Total CO2 Emission: ${totalCO2.toFixed(2)} units`;
    await displayDailyLeaderboard();
}

// ... [keep the rest of your code as it is] ...




// Display the daily leaderboard
async function displayDailyLeaderboard() {
    const leaderboardContainer = document.getElementById('dailyLeaderboard');
    const leaderboardMessage = document.getElementById('dailyLeaderboardMessage');
    
    const leaderboardData = await getLeaderboardData();

    if (leaderboardData.length === 0) {
        leaderboardMessage.textContent = "No data available";
        leaderboardContainer.innerHTML = "";
        return;
    }

    leaderboardMessage.textContent = "Daily Leaderboard:";

    let leaderboardHTML = "<ul>";
    leaderboardData.forEach(entry => {
        leaderboardHTML += `<li>${entry.username}: ${entry.emission.toFixed(2)} CO2 emissions</li>`;
    });
    leaderboardHTML += "</ul>";

    leaderboardContainer.innerHTML = leaderboardHTML;
}


// Display the monthly leaderboard
function displayMonthlyLeaderboard() {
    const leaderboardContainer = document.getElementById('monthlyLeaderboard');
    const leaderboardMessage = document.getElementById('monthlyLeaderboardMessage');

    if (monthlyLeaderboard.length === 0) {
        leaderboardMessage.textContent = "No data available";
        leaderboardContainer.innerHTML = "";
        return;
    }

    leaderboardMessage.textContent = "Monthly Leaderboard:";

    let leaderboardHTML = "<ul>";
    monthlyLeaderboard.forEach(entry => {
        leaderboardHTML += `<li>${entry.user}: ${entry.dailyEmission.toFixed(2)} CO2 emissions</li>`;
    });
    leaderboardHTML += "</ul>";

    leaderboardContainer.innerHTML = leaderboardHTML;
}

// Load leaderboards when the page is ready
window.onload = function() {
    displayDailyLeaderboard();
    displayMonthlyLeaderboard();
}

function loadLeaderboard() {
    const dailyLeaderboard = JSON.parse(localStorage.getItem('dailyLeaderboard')) || [];
    const leaderboardDiv = document.getElementById('dailyLeaderboard');

    leaderboardDiv.innerHTML = dailyLeaderboard.map(user => `<li>${user.user}: ${user.dailyEmission} units</li>`).join('');
}

async function getLeaderboardData() {
    try {
        let response = await fetch('/get-leaderboard');
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching leaderboard data: ", error);
        return [];
    }
}

