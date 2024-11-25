export async function populateObjectList() {
    try {
        const response = await fetch('objects.json');
        const objects = await response.json();

        const objectSelect = document.getElementById('objectSelect');
        objectSelect.innerHTML = '';

        objects.forEach((object) => {
            const option = document.createElement('option');
            option.value = object.type;
            option.textContent = `${object.type.charAt(0).toUpperCase() + object.type.slice(1)}`;
            objectSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to populate object list:', error);
    }
}
