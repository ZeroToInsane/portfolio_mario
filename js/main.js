// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    loadBlogPosts();
    initializeNavigation();
    initializeContactForm();
    initializeFormValidation();
    initializeMobileMenu()
});

// Load projects from JSON file
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();
        displayProjects(data.projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        displayErrorMessage();
    }
}

// Display projects in the grid
function displayProjects(projects) {
    const container = document.getElementById('projects-container');

    // Clear loading message
    container.innerHTML = '';

    // Sort projects to show featured ones first
    const sortedProjects = projects.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    });

    sortedProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        container.appendChild(projectCard);
    });
}

// Create individual project card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Create status badge
    const statusClass = project.status === 'completed' ? 'status-completed' : 'status-in-progress';
    const statusText = project.status === 'completed' ? 'Completed' : 'In Progress';

    // Create technology tags
    const techTags = project.technologies.map(tech =>
        `<span class="tech-tag">${tech}</span>`
    ).join('');

    // Create links
    let linksHTML = '';
    if (project.github) {
        linksHTML += `<a href="${project.github}" class="project-link github-link" target="_blank">GitHub</a>`;
    }
    if (project.live) {
        linksHTML += `<a href="${project.live}" class="project-link live-link" target="_blank">Live Demo</a>`;
    }

    card.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${project.title}</h3>
        </div>
        <span class="project-status ${statusClass}">${statusText}</span>
        <p class="project-description">${project.description}</p>
        <div class="project-technologies">
            ${techTags}
        </div>
        <div class="project-links">
            ${linksHTML}
        </div>
    `;

    return card;
}

// Display error message if projects fail to load
function displayErrorMessage() {
    const container = document.getElementById('projects-container');
    container.innerHTML = `
        <div class="project-loading">
            <p>Sorry, projects could not be loaded at this time.</p>
        </div>
    `;
}

// Initialize smooth scrolling navigation with offset
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20; // 20px extra padding

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');

    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(15, 20, 25, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = 'var(--dark-bg)';
        header.style.backdropFilter = 'none';
    }
});

// Blog functionality
let allBlogPosts = [];
let filteredBlogPosts = [];

// Load blog posts from JSON file
async function loadBlogPosts() {
    try {
        const response = await fetch('data/blog-posts.json');
        const data = await response.json();
        allBlogPosts = data.posts;
        filteredBlogPosts = [...allBlogPosts];
        displayBlogPosts(filteredBlogPosts);
        initializeBlogControls();
    } catch (error) {
        console.error('Error loading blog posts:', error);
        displayBlogErrorMessage();
    }
}

// Display blog posts in the grid
function displayBlogPosts(posts) {
    const container = document.getElementById('blog-container');

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <p>No blog posts found matching your criteria.</p>
            </div>
        `;
        return;
    }

    // Clear container
    container.innerHTML = '';

    // Sort posts by date (newest first) and featured status
    const sortedPosts = posts.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    sortedPosts.forEach(post => {
        const blogCard = createBlogCard(post);
        container.appendChild(blogCard);
    });
}

// Create individual blog card
function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';

    // Format date
    const formattedDate = formatDate(post.date);

    // Create tags
    const tagsHTML = post.tags.map(tag =>
        `<span class="blog-tag">#${tag}</span>`
    ).join('');

    card.innerHTML = `
        <div class="blog-meta">
            <span class="blog-category">${getCategoryName(post.category)}</span>
            <span>${post.readTime}</span>
        </div>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
        <div class="blog-tags">
            ${tagsHTML}
        </div>
        <div class="blog-meta">
            <span>${formattedDate}</span>
            ${post.featured ? '<span style="color: var(--primary-color);">★ Featured</span>' : ''}
        </div>
    `;

    // Add click event for future blog post detail view
    card.addEventListener('click', () => {
        console.log(`Opening blog post: ${post.title}`);
        // Future: Open blog post detail view
    });

    return card;
}

// Initialize blog search and filter controls
function initializeBlogControls() {
    const searchInput = document.getElementById('blog-search');
    const categoryFilter = document.getElementById('category-filter');

    // Search functionality
    searchInput.addEventListener('input', function() {
        filterBlogPosts();
    });

    // Category filter functionality
    categoryFilter.addEventListener('change', function() {
        filterBlogPosts();
    });
}

// Filter blog posts based on search and category
function filterBlogPosts() {
    const searchTerm = document.getElementById('blog-search').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;

    filteredBlogPosts = allBlogPosts.filter(post => {
        // Search in title, excerpt, and tags
        const matchesSearch = searchTerm === '' ||
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm));

        // Filter by category
        const matchesCategory = selectedCategory === '' || post.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayBlogPosts(filteredBlogPosts);
}

// Helper function to format date
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper function to get readable category name
function getCategoryName(category) {
    const categoryNames = {
        'webdev': 'Web Dev',
        'programming': 'Programming',
        'tutorial': 'Tutorial',
        'thoughts': 'Thoughts'
    };
    return categoryNames[category] || category;
}

// Display error message if blog posts fail to load
function displayBlogErrorMessage() {
    const container = document.getElementById('blog-container');
    container.innerHTML = `
        <div class="blog-loading">
            <p>Sorry, blog posts could not be loaded at this time.</p>
        </div>
    `;
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    }
}

// Handle contact form submission
async function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const messageDiv = document.getElementById('form-message');

    // Get form data
    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
    };

    // Basic validation
    if (!validateFormData(formData)) {
        showFormMessage('Please fill in all required fields correctly.', 'error');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    hideFormMessage();

    try {
        // Simulate form submission (replace with real API call later)
        await simulateFormSubmission(formData);

        // Show success message
        showFormMessage('Thank you for your message! I\'ll get back to you soon.', 'success');

        // Reset form
        form.reset();

    } catch (error) {
        // Show error message
        showFormMessage('Sorry, there was an error sending your message. Please try again later.', 'error');
        console.error('Form submission error:', error);

    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Validate form data
function validateFormData(data) {
    // Check if all fields are filled
    if (!data.name || !data.email || !data.subject || !data.message) {
        return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return false;
    }

    // Check minimum lengths
    if (data.name.length < 2 || data.subject.length < 5 || data.message.length < 10) {
        return false;
    }

    return true;
}

// Simulate form submission (replace with real API call)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                console.log('Form submitted successfully:', formData);
                resolve('Success');
            } else {
                reject(new Error('Simulated network error'));
            }
        }, 2000); // 2 second delay to show loading state
    });
}

// Show form message
function showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideFormMessage();
        }, 5000);
    }
}

// Hide form message
function hideFormMessage() {
    const messageDiv = document.getElementById('form-message');
    messageDiv.style.display = 'none';
}

// Add real-time validation feedback
function initializeFormValidation() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        // Add input event listener for real-time validation
        input.addEventListener('input', function() {
            validateField(this);
        });

        // Add blur event listener
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error styling
    field.style.borderColor = '#333';

    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Specific validations
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;

        case 'text':
            if (field.name === 'name' && value && value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
            if (field.name === 'subject' && value && value.length < 5) {
                isValid = false;
                errorMessage = 'Subject must be at least 5 characters';
            }
            break;

        default:
            if (field.name === 'message' && value && value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters';
            }
    }

    // Apply validation styling
    if (!isValid) {
        field.style.borderColor = 'var(--primary-color)';
    } else if (value) {
        field.style.borderColor = 'var(--accent-color)';
    }

    return isValid;
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileToggle.contains(event.target) && !navLinks.contains(event.target)) {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}
