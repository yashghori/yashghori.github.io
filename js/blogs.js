// Use fetch to get the JSON file
fetch('../json/blog.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON file
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error('Error fetching JSON:', error));
