const form = document.getElementById('auditForm');
const messageDiv = document.getElementById('message');
const auditList = document.getElementById('auditList');

document.addEventListener('DOMContentLoaded', loadAudits);

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    data.area = Number(data.area);
    data.consumption = Number(data.consumption);

    try {
        // POST
        const response = await fetch('/api/audits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('success', result.message);
            form.reset(); // Clear form fields
            loadAudits(); // Refresh the list
        } else {
            showMessage('error', result.message || 'Error saving data');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('error', 'Server connection error');
    }
});

// Fetch all audits from server
async function loadAudits() {
    try {
        const response = await fetch('/api/audits');
        const audits = await response.json();
        displayAudits(audits);
    } catch (error) {
        console.error('Error loading audits:', error);
        showMessage('error', 'Could not load data from server');
    }
}

// Render audits to HTML
function displayAudits(audits) {
    if (audits.length === 0) {
        auditList.innerHTML = '<p style="color: #666;">Немає проведених аудитів</p>';
        return;
    }

    auditList.innerHTML = audits.map(audit => `
        <div class="audit-card">
            <h3>${audit.address}</h3>
            <p><strong>Тип об'єкта:</strong> ${getBuildingTypeName(audit.buildingType)}</p>
            <p><strong>Площа:</strong> ${audit.area} м²</p>
            <p><strong>Споживання:</strong> ${audit.consumption} кВт·год</p>
            
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
            
            <p><strong>Питоме споживання:</strong> ${audit.specificConsumption} кВт·год/м²</p>
            <p><strong>Статус норм:</strong> 
                <span class="${audit.normExceeded ? 'norm-exceeded' : 'norm-ok'}">
                    ${audit.normExceeded ? '⚠️ Перевищення норми!' : '✅ В межах норми'}
                </span>
            </p>
            
            <button class="btn btn-delete" onclick="deleteAudit('${audit._id}')">Видалити</button>
        </div>
    `).join('');
}

// Delete audit by ID
async function deleteAudit(id) {
    if (!confirm('Ви впевнені, що хочете видалити цей запис?')) {
        return;
    }

    try {
        const response = await fetch(`/api/audits/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showMessage('success', result.message);
            loadAudits(); 
        } else {
            showMessage('error', 'Error deleting data');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('error', 'Server connection error');
    }
}

// Show temporary success/error messages
function showMessage(type, text) {
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';

    // Hide message after 4 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 4000);
}

// Translate building types to Ukrainian
function getBuildingTypeName(type) {
    const types = {
        'residential': 'Житловий будинок',
        'commercial': 'Комерційний об\'єкт',
        'industrial': 'Промисловий об\'єкт',
        'public': 'Об\'єкт соціальної сфери'
    };
    return types[type] || type;
}