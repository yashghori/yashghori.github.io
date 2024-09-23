fetch('../json/blog.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON file
    })
    .then(data => {
        // Function to extract the blog ID from the URL
        function getBlogIdFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }

        // Get the blog ID from the URL
        const blogId = getBlogIdFromUrl();

        // Find the corresponding blog post
        const blog = data.find(b => b.id == blogId);

        // If the blog exists, display it
        if (blog) {
            // Set the title and date
            document.getElementById('blogTitle').innerText = blog.content.find(c => c.type === 'text').value;
            document.getElementById('blogDate').innerText = blog.postdate;

            // Display the content dynamically (text and image alternation)
            const blogContentContainer = document.getElementById('blogContent');
            blogContentContainer.innerHTML = ''; // Clear existing content if any

            blog.content.forEach(contentItem => {
                if (contentItem.type === 'text') {
                    // Create and append a text element
                    const textElement = document.createElement('p');
                    textElement.innerHTML = contentItem.value;
                    blogContentContainer.appendChild(textElement);
                } else if (contentItem.type === 'image') {
                    // Create and append an image element
                    const imageElement = document.createElement('img');
                    imageElement.src = contentItem.value;
                    imageElement.alt = 'Blog image';
                    imageElement.style.width = '100%'; // Adjust the width if necessary
                    blogContentContainer.appendChild(imageElement);
                }
            });

            // Set the author and images
            document.getElementById('authImage').src = blog.content.find(c => c.type === 'image').value;
            document.getElementById('blogAuth').innerText = blog.auther;
        } else {
            document.getElementById('blogTitle').innerText = "Blog not found";
            document.getElementById('blogContent').innerText = "The blog you are looking for does not exist.";
        }
    })
    .catch(error => console.error('Error fetching JSON:', error));
