let blogData = {};
// Use fetch to get the JSON file
fetch('../json/blog.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON file
    })
    .then(data => {
        blogData = data;
        const container = document.querySelector('.blog-container');

        data.forEach(item => {
            // Create a new div for each blog post
            const blogItem = document.createElement('div');
            blogItem.classList.add('contact-item', 'blog-item');

            blogItem.innerHTML = `
            <div class="contact-item-inner outer-shadow">
                <div class="blog-header">
                    <a target="_blank" href="#"><span>${item.title}</span></a>
                    <img src="${item.topiclogo}" alt="">
                </div>
                <div class="blog-description">
                    <p>${item.description}</p>
                </div>
                <div class="blog-meta-data">
                    <p class="blog-date">${item.postdate}</p>
                    <div class="blog-auther">
                        <img src="${item.userImage}" alt="">
                        <p class="auther-name">Yash Ghori</p>
                    </div>
                </div>
            </div>
        `;
            // Add click event listener to the blog item
            blogItem.addEventListener('click', function () {
                openBlogPage(item.id);
            });

            // Append the newly created blog post div to the container
            container.appendChild(blogItem);

        });

    })
    .catch(error => console.error('Error fetching JSON:', error));

// Function to open full blog page on click
function openBlogPage(blogId) {
    console.log(`Opening blog with ID: ${blogId}`);
    window.location.href = `../html/blogdetail.html?id=${blogId}`;
}

