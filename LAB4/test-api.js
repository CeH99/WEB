const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log(' Тестування REST API: Розумний електролічильник...\n');

    try {
        // Створення нового лічильника
        console.log('1️ POST /api/smart-meters (Створення)');
        let response = await fetch(`${BASE_URL}/smart-meters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serialNumber: "SM-2024-003",
                consumerName: "Сидоров С.С.",
                address: "вул. Янгеля, 5",
                tariff: "day"
            })
        });
        let data = await response.json();
        console.log('Відповідь:', data);
        const newId = data.id;
        console.log('---\n');

        // Додавання показів
        console.log(`2️ POST /api/smart-meters/${newId}/readings (Нові покази)`);
        response = await fetch(`${BASE_URL}/smart-meters/${newId}/readings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activePower: 3.2,
                voltage: 228,
                current: 14.0,
                addedEnergy: 12.5,
                powerFactor: 0.96,
                tariff: "peak"
            })
        });
        data = await response.json();
        console.log('Відповідь:', data);
        console.log('---\n');

        // Отримання споживання
        console.log(`3️ GET /api/smart-meters/${newId}/consumption`);
        response = await fetch(`${BASE_URL}/smart-meters/${newId}/consumption`);
        data = await response.json();
        console.log('Відповідь:', data);
        console.log('---\n');

        // Отримання історії
        console.log(`4️ GET /api/smart-meters/${newId}/history`);
        response = await fetch(`${BASE_URL}/smart-meters/${newId}/history`);
        data = await response.json();
        console.log('Відповідь:', JSON.stringify(data, null, 2));
        console.log('---\n');

        // Перевірка фільтрації (Додаткова функціональність)
        console.log(`5️ GET /api/smart-meters?tariff=peak (Фільтрація)`);
        response = await fetch(`${BASE_URL}/smart-meters?tariff=peak`);
        data = await response.json();
        console.log('Відповідь:', data);
        console.log('---\n');

        console.log(' Тестування завершено успішно!');
    } catch (error) {
        console.error(' Помилка:', error.message);
    }
}

testAPI();