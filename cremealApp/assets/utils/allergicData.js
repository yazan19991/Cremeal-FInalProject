export default allergensArray=[
    { label: "Balsam of Peru", value: 1 },
    { label: "Buckwheat", value: 2 },
    { label: "Celery", value: 3 },
    { label: "Egg", value: 4 },
    { label: "Fish", value: 5 },
    { label: "Fruit", value: 6 },
    { label: "Garlic", value: 7 },
    { label: "Oats", value: 8 },
    { label: "Maize", value: 9 },
    { label: "Milk", value: 10 },
    { label: "Mustard", value: 11 },
    { label: "Peanut", value: 12 },
    { label: "Poultry Meat", value: 13 },
    { label: "Red Meat", value: 14 },
    { label: "Rice", value: 15 },
    { label: "Sesame", value: 16 },
    { label: "Shellfish", value: 17 },
    { label: "Soy", value: 18 },
    { label: "Sulfites", value: 19 },
    { label: "Tartrazine", value: 20 },
    { label: "Tree nut", value: 21 },
    { label: "Wheat", value: 22 },
];


// Function to get a label from an array based on a value
function getLabelFromArray(array, value) {
    return array.find(item => item.value === parseInt(value))?.label;
}

// Function to handle a comma-separated string of values
export function getAllergenLabels(allergicTo) {
    // Split the string by commas to get an array of values
    const valuesArray = allergicTo.split(',');
    
    // Map each value to its corresponding label
    const labelsArray = valuesArray.map(value => getLabelFromArray(allergensArray, value));
    
    // Return the labels as a comma-separated string or an array
    return labelsArray.join(', ');
}
