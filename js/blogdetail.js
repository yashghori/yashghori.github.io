// Use fetch to get the JSON file
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
            document.getElementById('blogTitle').innerText = blog.title;
            document.getElementById('blogDate').innerText = blog.postdate;
            document.getElementById('blogContent').innerHTML = blog.description;
            document.getElementById('blogImage').src = blog.topiclogo;
            document.getElementById('authImage').src = blog.userImage;
            document.getElementById('blogAuth').innerText = blog.auther;
        } else {
            document.getElementById('blogTitle').innerText = "Blog not found";
            document.getElementById('blogContent').innerText = "The blog you are looking for does not exist.";
        }     
    })
    .catch(error => console.error('Error fetching JSON:', error));