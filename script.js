const { jsPDF } = window.jspdf;
const investmentInput = document.getElementById('investment');
const buyPriceInput = document.getElementById('buyPrice');
const sellPriceInput = document.getElementById('sellPrice');
const investmentFeePercentageInput = document.getElementById('investmentFeePercentage');
const investmentFeeInput = document.getElementById('investmentFee');
const exitFeePercentageInput = document.getElementById('exitFeePercentage');
const exitFeeInput = document.getElementById('exitFee');
const currencySelect = document.getElementById('currency');
const cryptoSelect = document.getElementById('crypto');
const resultsBody = document.getElementById('resultsBody');
const themeToggle = document.getElementById('themeToggle');
const resetBtn = document.getElementById('resetBtn');
const addPairBtn = document.getElementById('addPairBtn');
const historyBtn = document.getElementById('historyBtn');
const exportBtn = document.getElementById('exportBtn');
const exportCSVBtn = document.getElementById('exportCSVBtn');
const spinner = document.getElementById('spinner');
const historyModal = document.getElementById('historyModal');
const historyContent = document.getElementById('historyContent');
const closeModal = document.getElementById('closeModal');
const totalProfit = document.getElementById('totalProfit');
const averageProfit = document.getElementById('averageProfit');
const maxAmount = document.getElementById('maxAmount');
const languageToggle = document.getElementById('languageToggle');
const sellPriceError = document.getElementById('sellPriceError');
const historyModalTitle = document.getElementById('historyModalTitle');
const notificationThreshold = document.getElementById('notificationThreshold');
const operationsFilter = document.getElementById('operationsFilter');
const chartType = document.getElementById('chartType');
const exportProfitChartBtn = document.getElementById('exportProfitChartBtn');
const exportGrowthChartBtn = document.getElementById('exportGrowthChartBtn');
const pairsTableBody = document.getElementById('pairsTableBody');
const retryPriceBtn = document.getElementById('retryPriceBtn');

let profitChart, growthChart;
let history = JSON.parse(simpleDecrypt(localStorage.getItem('calculationHistory')) || '[]');
let pairs = [{ currency: 'USDC', crypto: 'BTC' }];
let userInteracted = false;
let priceUpdateInterval;
let failedAttempts = 0;
const maxFailedAttempts = 3;

const translations = {
    en: {
        title: "Arbitrage Calculator (USDC)",
        currencyLabel: "Currency",
        cryptoLabel: "Cryptocurrency",
        investmentLabel: "Investment (USDC)",
        buyPriceLabel: "Buy Price (USDC)",
        sellPriceLabel: "Sell Price (USDC)",
        investmentFeePercentageLabel: "Investment Fee (%)",
        investmentFeeLabel: "Investment Fee (USDC)",
        exitFeePercentageLabel: "Exit Fee (%)",
        exitFeeLabel: "Exit Fee (USDC)",
        resetBtn: "Reset",
        addPairBtn: "Add Pair",
        historyBtn: "Show History",
        exportBtn: "Export to PDF",
        exportCSVBtn: "Export to CSV",
        themeToggle: "Toggle Theme",
        operation: "Operation",
        investment: "Investment (USDC)",
        buyPrice: "Buy Price (USDC)",
        sellPrice: "Sell Price (USDC)",
        profitPerTrade: "Profit/Loss per Trade (USDC)",
        profitPercentage: "Profit/Loss Percentage (%)",
        totalTakeHome: "Total Take-Home (USDC)",
        summary: "Summary Statistics",
        totalProfit: "Total Profit: ",
        averageProfit: "Average Profit per Operation: ",
        maxAmount: "Maximum Amount: ",
        historyModalTitle: "Calculation History",
        closeModal: "Close",
        profitChartTitle: "Profit and Fees Distribution by Operation",
        growthChartTitle: "Contribution to Total Profit",
        priceError: "Error fetching price from Binance API",
        networkError: "Network error: Unable to fetch price. Please check your internet connection.",
        retryPriceBtn: "Retry Price Update",
        tradingPairs: "Trading Pairs",
        action: "Action",
        deletePair: "Delete"
    },
    it: {
        title: "Calcolatore dell'arbitraggio (USDC)",
        currencyLabel: "Valuta",
        cryptoLabel: "Criptovaluta",
        investmentLabel: "Investimento (USDC)",
        buyPriceLabel: "Prezzo di Acquisto (USDC)",
        sellPriceLabel: "Prezzo di Vendita (USDC)",
        investmentFeePercentageLabel: "Commissione di Investimento (%)",
        investmentFeeLabel: "Commissione di Investimento (USDC)",
        exitFeePercentageLabel: "Commissione di Uscita (%)",
        exitFeeLabel: "Commissione di Uscita (USDC)",
        resetBtn: "Ripristina",
        addPairBtn: "Aggiungi Coppia",
        historyBtn: "Mostra Cronologia",
        exportBtn: "Esporta in PDF",
        exportCSVBtn: "Esporta in CSV",
        themeToggle: "Cambia Tema",
        operation: "Operazione",
        investment: "Investimento (USDC)",
        buyPrice: "Prezzo di Acquisto (USDC)",
        sellPrice: "Prezzo di Vendita (USDC)",
        profitPerTrade: "Profitto/Perdita per Operazione (USDC)",
        profitPercentage: "Percentuale di Profitto/Perdita (%)",
        totalTakeHome: "Totale Incassato (USDC)",
        summary: "Statistiche Riassuntive",
        totalProfit: "Profitto Totale: ",
        averageProfit: "Profitto Medio per Operazione: ",
        maxAmount: "Importo Massimo: ",
        historyModalTitle: "Cronologia dei Calcoli",
        closeModal: "Chiudi",
        profitChartTitle: "Distribuzione Profitti e Commissioni per Operazione",
        growthChartTitle: "Contributo al Profitto Totale",
        priceError: "Errore nel recupero del prezzo dall'API di Binance",
        networkError: "Errore di rete: Impossibile recuperare il prezzo. Controlla la tua connessione internet.",
        retryPriceBtn: "Riprova Aggiornamento Prezzo",
        tradingPairs: "Coppie di Trading",
        action: "Azione",
        deletePair: "Elimina"
    }
};

function updateLanguage(lang) {
    document.querySelector('h1').innerHTML = `${translations[lang].title} <i class="fas fa-coins text-green-600"></i>`;
    document.querySelectorAll('label[for="currency"]')[0].innerHTML = `<i class="fas fa-globe mr-1"></i> ${translations[lang].currencyLabel}`;
    document.querySelectorAll('label[for="crypto"]')[0].innerHTML = `<i class="fas fa-bitcoin mr-1"></i> ${translations[lang].cryptoLabel}`;
    document.querySelectorAll('label[for="investment"]')[0].innerHTML = `<i class="fas fa-coins mr-1"></i> ${translations[lang].investmentLabel}`;
    document.querySelectorAll('label[for="buyPrice"]')[0].innerHTML = `<i class="fas fa-shopping-cart mr-1"></i> ${translations[lang].buyPriceLabel}`;
    document.querySelectorAll('label[for="sellPrice"]')[0].innerHTML = `<i class="fas fa-hand-holding-usd mr-1"></i> ${translations[lang].sellPriceLabel}`;
    document.querySelectorAll('label[for="investmentFeePercentage"]')[0].innerHTML = `<i class="fas fa-percentage mr-1"></i> ${translations[lang].investmentFeePercentageLabel}`;
    document.querySelectorAll('label[for="investmentFee"]')[0].innerHTML = `<i class="fas fa-coins mr-1"></i> ${translations[lang].investmentFeeLabel}`;
    document.querySelectorAll('label[for="exitFeePercentage"]')[0].innerHTML = `<i class="fas fa-percentage mr-1"></i> ${translations[lang].exitFeePercentageLabel}`;
    document.querySelectorAll('label[for="exitFee"]')[0].innerHTML = `<i class="fas fa-sign-out-alt mr-1"></i> ${translations[lang].exitFeeLabel}`;
    resetBtn.innerHTML = `<i class="fas fa-undo mr-1"></i> ${translations[lang].resetBtn}`;
    addPairBtn.innerHTML = `<i class="fas fa-plus mr-1"></i> ${translations[lang].addPairBtn}`;
    historyBtn.innerHTML = `<i class="fas fa-history mr-1"></i> ${translations[lang].historyBtn}`;
    exportBtn.innerHTML = `<i class="fas fa-file-pdf mr-1"></i> ${translations[lang].exportBtn}`;
    exportCSVBtn.innerHTML = `<i class="fas fa-file-csv mr-1"></i> ${translations[lang].exportCSVBtn}`;
    retryPriceBtn.innerHTML = `<i class="fas fa-sync-alt mr-1"></i> ${translations[lang].retryPriceBtn}`;
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
        ? `<i class="fas fa-sun"></i> ${translations[lang].themeToggle}` 
        : `<i class="fas fa-moon"></i> ${translations[lang].themeToggle}`;
    document.querySelectorAll('th')[0].textContent = translations[lang].operation;
    document.querySelectorAll('th')[1].textContent = translations[lang].investment;
    document.querySelectorAll('th')[2].textContent = translations[lang].buyPrice;
    document.querySelectorAll('th')[3].textContent = translations[lang].sellPrice;
    document.querySelectorAll('th')[4].textContent = translations[lang].profitPerTrade;
    document.querySelectorAll('th')[5].textContent = translations[lang].profitPercentage;
    document.querySelectorAll('th')[6].textContent = translations[lang].totalTakeHome;
    document.querySelector('.pairs-table h3').textContent = translations[lang].tradingPairs;
    document.querySelectorAll('.pairs-table th')[0].textContent = translations[lang].currencyLabel;
    document.querySelectorAll('.pairs-table th')[1].textContent = translations[lang].cryptoLabel;
    document.querySelectorAll('.pairs-table th')[2].textContent = translations[lang].action;
    document.querySelector('.stats-card h3').textContent = translations[lang].summary;
    totalProfit.textContent = `${translations[lang].totalProfit} 0 ${currencySelect.value}`;
    averageProfit.textContent = `${translations[lang].averageProfit} 0 ${currencySelect.value}`;
    maxAmount.textContent = `${translations[lang].maxAmount} 0 ${currencySelect.value}`;
    historyModalTitle.textContent = translations[lang].historyModalTitle;
    closeModal.textContent = translations[lang].closeModal;
    sellPriceError.textContent = translations[lang].priceError;
    document.querySelector('#profitChartContainer h3').textContent = translations[lang].profitChartTitle;
    document.querySelector('#growthChartContainer h3').textContent = translations[lang].growthChartTitle;
    if (profitChart) profitChart.options.plugins.title.text = `${translations[lang].profitChartTitle} (${currencySelect.value})`;
    if (growthChart) growthChart.options.plugins.title.text = `${translations[lang].growthChartTitle} (${currencySelect.value})`;
    updatePairsTable();
    calculateResults();
}

async function fetchBinancePrice() {
    const crypto = cryptoSelect.value;
    let currency = currencySelect.value;
    const currencyMapping = { 'USDC': 'USDC', 'USD': 'USDT', 'EUR': 'EUR' };
    currency = currencyMapping[currency] || 'USDC';
    const symbol = `${crypto}${currency}`;
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        const data = await response.json();
        if (data.price) {
            const newPrice = parseFloat(data.price).toFixed(2);
            sellPriceInput.value = newPrice;
            sellPriceError.style.display = 'none';
            retryPriceBtn.style.display = 'none';
            failedAttempts = 0;
            localStorage.setItem(`cachedPrice_${symbol}`, newPrice);
            checkPriceNotification(newPrice);
        } else {
            throw new Error('Price not available');
        }
    } catch (error) {
        console.error("Error fetching Binance price:", error);
        const cachedPrice = localStorage.getItem(`cachedPrice_${symbol}`);
        if (cachedPrice) {
            sellPriceInput.value = cachedPrice;
            sellPriceError.textContent = `${translations[languageToggle.value].priceError} (Using cached price: ${cachedPrice})`;
            sellPriceError.style.display = 'block';
        } else {
            sellPriceError.textContent = translations[languageToggle.value].priceError;
            sellPriceError.style.display = 'block';
        }
        failedAttempts++;
        if (failedAttempts >= maxFailedAttempts) {
            clearInterval(priceUpdateInterval);
            retryPriceBtn.style.display = 'block';
            alert(translations[languageToggle.value].networkError);
        }
    }
    calculateResults();
}

function startPriceUpdates() {
    fetchBinancePrice();
    if (priceUpdateInterval) clearInterval(priceUpdateInterval);
    priceUpdateInterval = setInterval(fetchBinancePrice, 60000);
}

function updatePairsTable() {
    pairsTableBody.innerHTML = '';
    pairs.forEach((pair, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pair.currency}</td>
            <td>${pair.crypto}</td>
            <td>
                <button class="delete-pair-btn" data-index="${index}">
                    <i class="fas fa-trash-alt mr-1"></i> ${translations[languageToggle.value].deletePair}
                </button>
            </td>
        `;
        pairsTableBody.appendChild(tr);
    });

    document.querySelectorAll('.delete-pair-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            pairs.splice(index, 1);
            saveData();
            updatePairsTable();
            calculateResults();
        });
    });
}

function simpleEncrypt(text) {
    return btoa(text);
}

function simpleDecrypt(text) {
    try {
        return text ? atob(text) : '{}';
    } catch (e) {
        console.error("Decoding error:", e);
        return '{}';
    }
}

function loadSavedData() {
    const savedDataEncrypted = localStorage.getItem('calculatorData');
    let savedData = {};
    if (savedDataEncrypted) {
        try {
            savedData = JSON.parse(simpleDecrypt(savedDataEncrypted));
        } catch (e) {
            console.error("Failed to parse saved data:", e);
            savedData = {};
            localStorage.removeItem('calculatorData');
        }
    }
    if (savedData) {
        investmentInput.value = savedData.investment || 6300;
        buyPriceInput.value = savedData.buyPrice || 2405;
        investmentFeePercentageInput.value = savedData.investmentFeePercentage || 0.1;
        investmentFeeInput.value = savedData.investmentFee || 0;
        exitFeePercentageInput.value = savedData.exitFeePercentage || 0.1;
        exitFeeInput.value = savedData.exitFee || 0;
        currencySelect.value = savedData.currency || 'USDC';
        cryptoSelect.value = savedData.crypto || 'BTC';
        pairs = savedData.pairs || [{ currency: 'USDC', crypto: 'BTC' }];
    }
    updatePairsTable();
    startPriceUpdates();
}

function saveData() {
    const data = {
        investment: investmentInput.value,
        buyPrice: buyPriceInput.value,
        sellPrice: sellPriceInput.value,
        investmentFeePercentage: investmentFeePercentageInput.value,
        investmentFee: investmentFeeInput.value,
        exitFeePercentage: exitFeePercentageInput.value,
        exitFee: exitFeeInput.value,
        currency: currencySelect.value,
        crypto: cryptoSelect.value,
        pairs: pairs
    };
    localStorage.setItem('calculatorData', simpleEncrypt(JSON.stringify(data)));
}

function calculateResults() {
    spinner.style.display = 'block';
    setTimeout(() => {
        const investment = parseFloat(investmentInput.value) || 0;
        const buyPrice = parseFloat(buyPriceInput.value) || 0;
        const sellPrice = parseFloat(sellPriceInput.value) || 0;
        const investmentFeePercentage = parseFloat(investmentFeePercentageInput.value) || 0;
        const exitFeePercentage = parseFloat(exitFeePercentageInput.value) || 0;
        const currency = currencySelect.value;

        const investmentFee = investment * (investmentFeePercentage / 100);
        const profitPerTrade = sellPrice - buyPrice;
        const exitFee = profitPerTrade * (exitFeePercentage / 100);

        investmentFeeInput.value = investmentFee.toFixed(2);
        exitFeeInput.value = exitFee.toFixed(2);

        let currentInvestment = investment - investmentFee;
        const profitPercentage = buyPrice > 0 ? (profitPerTrade / buyPrice) * 100 : 0;
        const maxOperations = parseInt(operationsFilter.value);

        const results = [];
        const feesPerTrade = [];
        for (let i = 1; i <= maxOperations; i++) {
            const totalTakeHome = currentInvestment * (1 + (profitPerTrade / buyPrice)) - exitFee;
            const totalFees = (currentInvestment * (investmentFeePercentage / 100)) + ((totalTakeHome - currentInvestment) * (exitFeePercentage / 100));
            feesPerTrade.push(totalFees.toFixed(2));
            results.push({
                operation: i,
                investment: currentInvestment.toFixed(2),
                buyPrice: buyPrice.toFixed(2),
                sellPrice: sellPrice.toFixed(2),
                profitPerTrade: profitPerTrade.toFixed(2),
                profitPercentage: profitPercentage.toFixed(2),
                totalTakeHome: totalTakeHome.toFixed(2),
                totalFees: totalFees.toFixed(2)
            });
            currentInvestment = totalTakeHome;
        }

        resultsBody.innerHTML = '';
        results.forEach(row => {
            const tr = document.createElement('tr');
            tr.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            tr.innerHTML = `
                <td class="py-3 px-6">${row.operation}</td>
                <td class="py-3 px-6">${row.investment} ${currency}</td>
                <td class="py-3 px-6">${row.buyPrice} ${currency}</td>
                <td class="py-3 px-6">${row.sellPrice} ${currency}</td>
                <td class="py-3 px-6 ${row.profitPerTrade >= 0 ? 'positive' : 'negative'}">${row.profitPerTrade} ${currency}</td>
                <td class="py-3 px-6 ${row.profitPercentage >= 0 ? 'positive' : 'negative'}">${row.profitPercentage}%</td>
                <td class="py-3 px-6">${row.totalTakeHome} ${currency}</td>
            `;
            resultsBody.appendChild(tr);
            setTimeout(() => tr.classList.remove('opacity-0'), 50 * row.operation);
        });

        const labels = results.map(row => row.operation);
        const profitData = results.map(row => parseFloat(row.profitPerTrade));
        const feesData = results.map(row => parseFloat(row.totalFees));
        const growthData = results.map(row => parseFloat(row.totalTakeHome));

        const totalProfitValue = growthData[growthData.length - 1] - growthData[0];
        const averageProfitValue = totalProfitValue / maxOperations;
        const maxAmountValue = Math.max(...growthData);

        totalProfit.textContent = `${translations[languageToggle.value].totalProfit}${totalProfitValue.toFixed(2)} ${currency}`;
        averageProfit.textContent = `${translations[languageToggle.value].averageProfit}${averageProfitValue.toFixed(2)} ${currency}`;
        maxAmount.textContent = `${translations[languageToggle.value].maxAmount}${maxAmountValue.toFixed(2)} ${currency}`;

        const profitContributions = results.map(row => {
            const profit = parseFloat(row.totalTakeHome) - parseFloat(row.investment);
            return profit > 0 ? profit : 0;
        });

        if (profitChart) profitChart.destroy();
        if (growthChart) growthChart.destroy();

        const chartTypeValue = chartType.value;
        const chartOptions = {
            plugins: {
                title: { display: true, font: { size: 16, family: 'Poppins' }, color: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000' },
                legend: { display: true, labels: { font: { size: 12, family: 'Poppins' }, color: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000' } },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value.toFixed(2),
                    font: { size: 10, family: 'Poppins' },
                    color: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000'
                }
            },
            scales: {
                x: {
                    title: { display: true, text: translations[languageToggle.value].operation, font: { size: 12, family: 'Poppins' }, color: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000' },
                    ticks: { font: { size: 12, family: 'Poppins' }, color: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000', maxRotation: 45, minRotation: 45 }
                },
                y: {
                    title: { display: true, font: { size: 12, family: 'Poppins' }, color: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000' },
                    ticks: { font: { size: 12, family: 'Poppins' }, color: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000' },
                    beginAtZero: true
                }
            },
            animation: { duration: 1500, easing: 'easeInOutQuart' }
        };

        profitChart = new Chart(document.getElementById('profitChart'), {
            type: chartTypeValue,
            data: {
                labels: labels,
                datasets: [
                    {
                        label: translations[languageToggle.value].profitPerTrade,
                        data: profitData,
                        backgroundColor: document.body.classList.contains('dark-mode') ? '#81C784' : '#1976D2',
                        borderColor: document.body.classList.contains('dark-mode') ? '#66BB6A' : '#0D47A1',
                        borderWidth: 1
                    },
                    {
                        label: translations[languageToggle.value].totalFees || 'Total Fees',
                        data: feesData,
                        backgroundColor: document.body.classList.contains('dark-mode') ? '#EF9A9A' : '#E57373',
                        borderColor: document.body.classList.contains('dark-mode') ? '#EF5350' : '#B71C1C',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...chartOptions,
                plugins: {
                    ...chartOptions.plugins,
                    title: { ...chartOptions.plugins.title, text: `${translations[languageToggle.value].profitChartTitle} (${currency})` },
                    datalabels: chartOptions.plugins.datalabels
                },
                scales: {
                    x: chartOptions.scales.x,
                    y: { ...chartOptions.scales.y, title: { ...chartOptions.scales.y.title, text: `Amount (${currency})` }, stacked: true }
                }
            }
        });

        growthChart = new Chart(document.getElementById('growthChart'), {
            type: 'pie',
            data: {
                labels: labels.map(label => `${translations[languageToggle.value].operation} ${label}`),
                datasets: [{
                    label: translations[languageToggle.value].growthChartTitle,
                    data: profitContributions,
                    backgroundColor: ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#FFCC5C', '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C'],
                    borderColor: document.body.classList.contains('dark-mode') ? '#ECF0F1' : '#000000',
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: { ...chartOptions.plugins.title, text: `${translations[languageToggle.value].growthChartTitle} (${currency})` },
                    legend: { ...chartOptions.plugins.legend },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${percentage}%`;
                        },
                        font: { size: 12, family: 'Poppins' },
                        color: '#FFFFFF'
                    }
                },
                animation: { duration: 1500, easing: 'easeInOutQuart' }
            }
        });

        history.push({
            timestamp: new Date().toLocaleString(),
            results: results,
            currency: currency,
            crypto: cryptoSelect.value
        });
        localStorage.setItem('calculationHistory', simpleEncrypt(JSON.stringify(history)));

        spinner.style.display = 'none';
    }, 500);
}

function resetFields() {
    investmentInput.value = 6300;
    buyPriceInput.value = 2405;
    investmentFeePercentageInput.value = 0.1;
    exitFeePercentageInput.value = 0.1;
    currencySelect.value = 'USDC';
    cryptoSelect.value = 'BTC';
    pairs = [{ currency: 'USDC', crypto: 'BTC' }];
    userInteracted = true;
    failedAttempts = 0;
    updatePairsTable();
    startPriceUpdates();
    calculateResults();
}

function showHistory() {
    historyContent.innerHTML = '';
    history.forEach((entry, index) => {
        const div = document.createElement('div');
        div.classList.add('mb-4');
        div.innerHTML = `
            <h3 class="text-lg font-semibold">Calculation #${index + 1} - ${entry.timestamp}</h3>
            <p>Currency: ${entry.currency}, Cryptocurrency: ${entry.crypto}</p>
            <table class="w-full text-center border-collapse mt-2">
                <thead>
                    <tr>
                        <th class="py-2 px-4 bg-gray-200 dark:bg-gray-600">${translations[languageToggle.value].operation}</th>
                        <th class="py-2 px-4 bg-gray-200 dark:bg-gray-600">${translations[languageToggle.value].investment}</th>
                        <th class="py-2 px-4 bg-gray-200 dark:bg-gray-600">${translations[languageToggle.value].buyPrice}</th>
                        <th class="py-2 px-4 bg-gray-200 dark:bg-gray-600">${translations[languageToggle.value].sellPrice}</th>
                        <th class="py-2 px-4 bg-gray-200 dark:bg-gray-600">${translations[languageToggle.value].profitPerTrade}</th>
                        <th class="py-2 px-4 bg-gray-200 dark:bg-gray-600">${translations[languageToggle.value].profitPercentage}</th>
                        <th class="py-2 px-4 bg-gray-200 dark:bg-gray-600">${translations[languageToggle.value].totalTakeHome}</th>
                    </tr>
                </thead>
                <tbody>
                    ${entry.results.map(row => `
                        <tr>
                            <td class="py-2 px-4">${row.operation}</td>
                            <td class="py-2 px-4">${row.investment}</td>
                            <td class="py-2 px-4">${row.buyPrice}</td>
                            <td class="py-2 px-4">${row.sellPrice}</td>
                            <td class="py-2 px-4 ${row.profitPerTrade >= 0 ? 'positive' : 'negative'}">${row.profitPerTrade}</td>
                            <td class="py-2 px-4 ${row.profitPercentage >= 0 ? 'positive' : 'negative'}">${row.profitPercentage}%</td>
                            <td class="py-2 px-4">${row.totalTakeHome}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        historyContent.appendChild(div);
    });
    historyModal.style.display = 'flex';
}

async function exportToPDF() {
    const doc = new jsPDF();
    const container = document.querySelector('.container');
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    doc.save('investment_calculator.pdf');
}

function exportToCSV() {
    const csv = [];
    history.forEach((entry, index) => {
        csv.push(`Calculation #${index + 1}, ${entry.timestamp}, ${entry.currency}, ${entry.crypto}`);
        entry.results.forEach(row => {
            csv.push(`${row.operation}, ${row.investment}, ${row.buyPrice}, ${row.sellPrice}, ${row.profitPerTrade}, ${row.profitPercentage}, ${row.totalTakeHome}`);
        });
        csv.push('');
    });
    const csvContent = `data:text/csv;charset=utf-8,${csv.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'calculation_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function exportChartAsPNG(chartId, filename) {
    const canvas = document.getElementById(chartId).getContext('2d').canvas;
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function checkPriceNotification(newPrice) {
    const oldPrice = parseFloat(sellPriceInput.dataset.oldPrice) || newPrice;
    const threshold = parseFloat(notificationThreshold.value);
    const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;
    if (Math.abs(percentageChange) >= threshold) {
        alert(`Price changed by ${percentageChange.toFixed(2)}% (Threshold: ±${threshold}%)`);
    }
    sellPriceInput.dataset.oldPrice = newPrice;
}

function toggleTheme() {
    const hour = new Date().getHours();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if ((hour >= 18 || hour < 6) || prefersDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
        ? `<i class="fas fa-sun"></i> ${translations[languageToggle.value].themeToggle}` 
        : `<i class="fas fa-moon"></i> ${translations[languageToggle.value].themeToggle}`;
    calculateResults();
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
        ? `<i class="fas fa-sun"></i> ${translations[languageToggle.value].themeToggle}` 
        : `<i class="fas fa-moon"></i> ${translations[languageToggle.value].themeToggle}`;
    userInteracted = true;
    calculateResults();
});

resetBtn.addEventListener('click', resetFields);
addPairBtn.addEventListener('click', () => {
    pairs.push({ 
        currency: currencySelect.value, 
        crypto: cryptoSelect.value 
    });
    saveData();
    updatePairsTable();
    calculateResults();
});
historyBtn.addEventListener('click', showHistory);
closeModal.addEventListener('click', () => historyModal.style.display = 'none');
exportBtn.addEventListener('click', exportToPDF);
exportCSVBtn.addEventListener('click', exportToCSV);
exportProfitChartBtn.addEventListener('click', () => exportChartAsPNG('profitChart', 'profit_distribution'));
exportGrowthChartBtn.addEventListener('click', () => exportChartAsPNG('growthChart', 'growth_contribution'));
operationsFilter.addEventListener('change', calculateResults);
chartType.addEventListener('change', calculateResults);
retryPriceBtn.addEventListener('click', () => {
    failedAttempts = 0;
    startPriceUpdates();
    retryPriceBtn.style.display = 'none';
});

document.querySelectorAll('.toggle-chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const container = document.getElementById(targetId);
        const canvas = container.querySelector('canvas');
        if (canvas.classList.contains('chart-hidden')) {
            canvas.classList.remove('chart-hidden');
            btn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
            canvas.classList.add('chart-hidden');
            btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    });
});

investmentInput.addEventListener('input', () => { userInteracted = true; saveData(); calculateResults(); });
buyPriceInput.addEventListener('input', () => { userInteracted = true; saveData(); calculateResults(); });
investmentFeePercentageInput.addEventListener('input', () => { userInteracted = true; saveData(); calculateResults(); });
exitFeePercentageInput.addEventListener('input', () => { userInteracted = true; saveData(); calculateResults(); });
currencySelect.addEventListener('change', () => { userInteracted = true; saveData(); fetchBinancePrice(); calculateResults(); });
cryptoSelect.addEventListener('change', () => { userInteracted = true; saveData(); fetchBinancePrice(); calculateResults(); });
languageToggle.addEventListener('change', () => updateLanguage(languageToggle.value));
notificationThreshold.addEventListener('change', () => { userInteracted = true; });

loadSavedData();
toggleTheme();
calculateResults();
setInterval(toggleTheme, 3600000);