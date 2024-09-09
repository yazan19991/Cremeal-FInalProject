export default beliefsArray = [
    { label: "Not religious", value: 1 },
    { label: "Christianity", value: 2 },
    { label: "Islam", value: 3 },
    { label: "Jewish", value: 4 },
];

// Function to get a label from an array based on a value
function getLabelFromArray(array, value) {
    return array.find(item => item.value === parseInt(value))?.label;
}

// Function to handle a comma-separated string of values
export function getBeliefLabels(beliefValues) {
    if (typeof beliefValues === 'string') {
        return beliefValues.split(',')
            .map(value => getLabelFromArray(beliefsArray, value))
            .filter(label => label) // Filter out any null or undefined labels
            .join(', ');
    } else {
        // If it's not a string, assume it's a single value and return the label
        return getLabelFromArray(beliefsArray, beliefValues);
    }
}
