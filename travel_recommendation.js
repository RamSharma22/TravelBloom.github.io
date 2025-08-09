
let travelData = {};
let currentSection = 'home';

document.addEventListener('DOMContentLoaded', function() {
    loadTravelData();
    setupEventListeners();
    showSection('home');
});

async function loadTravelData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        travelData = await response.json();
        console.log('Travel data loaded successfully:', travelData);
    } catch (error) {
        console.error('Error loading travel data:', error);
        showError('Failed to load travel data. Please try again later.');
    }
}


function setupEventListeners() {
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDestinations();
            }
        });
    }

    
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
    }
    
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer) {
        if (sectionName === 'home') {
            searchContainer.style.display = 'flex';
        } else {
            searchContainer.style.display = 'none';
        }
    }
  
    updatePageTitle(sectionName);
    
    if (sectionName !== 'home') {
        clearResults();
    }
}

function updatePageTitle(section) {
    const titles = {
        'home': 'TravelBloom - Discover Your Next Adventure',
        'about': 'About Us - TravelBloom',
        'contact': 'Contact Us - TravelBloom'
    };
    
    document.title = titles[section] || titles['home'];
}


async function searchDestinations() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        showError('Please enter a search term.');
        return;
    }
    
    if (Object.keys(travelData).length === 0) {
        showError('Travel data is not loaded yet. Please try again.');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        const results = performSearch(query);
        displayResults(results, query);
    }, 500);
}


function performSearch(query) {
    let results = [];
    
    if (query.includes('countr') || query.includes('city') || query.includes('australia') || 
        query.includes('japan') || query.includes('brazil') || query.includes('sydney') || 
        query.includes('tokyo') || query.includes('melbourne') || query.includes('kyoto') || 
        query.includes('rio') || query.includes('sao paulo')) {
        
        travelData.countries?.forEach(country => {
            country.cities?.forEach(city => {
                if (city.name.toLowerCase().includes(query) || 
                    country.name.toLowerCase().includes(query) ||
                    city.description.toLowerCase().includes(query)) {
                    results.push({
                        ...city,
                        type: 'city',
                        country: country.name,
                        timeZone: getTimeZone(country.name)
                    });
                }
            });
        });
    }
    
    if (query.includes('temple') || query.includes('angkor') || query.includes('taj') || 
        query.includes('mahal') || query.includes('cambodia') || query.includes('india')) {
        
        travelData.temples?.forEach(temple => {
            if (temple.name.toLowerCase().includes(query) || 
                temple.description.toLowerCase().includes(query)) {
                results.push({
                    ...temple,
                    type: 'temple',
                    timeZone: getTimeZoneFromLocation(temple.name)
                });
            }
        });
    }
    
    if (query.includes('beach') || query.includes('bora') || query.includes('copacabana') || 
        query.includes('polynesia') || query.includes('brazil')) {
        
        travelData.beaches?.forEach(beach => {
            if (beach.name.toLowerCase().includes(query) || 
                beach.description.toLowerCase().includes(query)) {
                results.push({
                    ...beach,
                    type: 'beach',
                    timeZone: getTimeZoneFromLocation(beach.name)
                });
            }
        });
    }
    if (results.length === 0) {
        results = searchAllCategories(query);
    }
    
    return results;
}

function searchAllCategories(query) {
    let allResults = [];

    travelData.countries?.forEach(country => {
        country.cities?.forEach(city => {
            allResults.push({
                ...city,
                type: 'city',
                country: country.name,
                timeZone: getTimeZone(country.name)
            });
        });
    });
    
    travelData.temples?.forEach(temple => {
        allResults.push({
            ...temple,
            type: 'temple',
            timeZone: getTimeZoneFromLocation(temple.name)
        });
    });

    travelData.beaches?.forEach(beach => {
        allResults.push({
            ...beach,
            type: 'beach',
            timeZone: getTimeZoneFromLocation(beach.name)
        });
    });
    return allResults.slice(0, 6);
}

function getTimeZone(countryName) {
    const timeZones = {
        'Australia': 'Australia/Sydney',
        'Japan': 'Asia/Tokyo',
        'Brazil': 'America/Sao_Paulo',
        'Cambodia': 'Asia/Phnom_Penh',
        'India': 'Asia/Kolkata',
        'French Polynesia': 'Pacific/Tahiti'
    };
    
    return timeZones[countryName] || 'UTC';
}

function getTimeZoneFromLocation(locationName) {
    if (locationName.includes('Cambodia')) return 'Asia/Phnom_Penh';
    if (locationName.includes('India')) return 'Asia/Kolkata';
    if (locationName.includes('French Polynesia')) return 'Pacific/Tahiti';
    if (locationName.includes('Brazil')) return 'America/Sao_Paulo';
    return 'UTC';
}

function displayResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (!results || results.length === 0) {
        resultsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3 style="color: #666;">No results found for "${query}"</h3>
                <p style="color: #999;">Try searching for "beaches", "temples", or "countries"</p>
            </div>
        `;
    } else {
        resultsGrid.innerHTML = results.map(result => createResultCard(result)).join('');
    }
    
    searchResults.style.display = 'block';
    searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createResultCard(result) {
    const localTime = getCurrentTime(result.timeZone);
    const typeIcon = getTypeIcon(result.type);
    const typeColor = getTypeColor(result.type);
    
    return `
        <div class="result-card">
            <img src="${result.imageUrl}" alt="${result.name}" onerror="this.src='https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400'">
            <div class="card-content">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="${typeIcon}" style="color: ${typeColor};"></i>
                    <span style="background: ${typeColor}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; text-transform: uppercase;">${result.type}</span>
                </div>
                <h3>${result.name}</h3>
                ${result.country ? `<p style="color: #ff6b35; font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${result.country}</p>` : ''}
                <p>${result.description}</p>
                <div class="local-time">
                    <i class="fas fa-clock"></i> Local Time: ${localTime}
                </div>
            </div>
        </div>
    `;
}

function getTypeIcon(type) {
    const icons = {
        'city': 'fas fa-city',
        'temple': 'fas fa-place-of-worship',
        'beach': 'fas fa-umbrella-beach'
    };
    return icons[type] || 'fas fa-map-marker-alt';
}

function getTypeColor(type) {
    const colors = {
        'city': '#2c5aa0',
        'temple': '#8b5a2b',
        'beach': '#20b2aa'
    };
    return colors[type] || '#666';
}

function getCurrentTime(timeZone) {
    try {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            timeZone: timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}

function clearResults() {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (resultsGrid) {
        resultsGrid.innerHTML = '';
    }
}

function showLoading() {
    const resultsGrid = document.getElementById('resultsGrid');
    const searchResults = document.getElementById('searchResults');
    
    resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1;" class="loading">
            <div class="spinner"></div>
            <p style="margin-top: 1rem; color: #666;">Searching amazing destinations...</p>
        </div>
    `;
    
    searchResults.style.display = 'block';
}

function showError(message) {
    const resultsGrid = document.getElementById('resultsGrid');
    const searchResults = document.getElementById('searchResults');
    
    resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b35; margin-bottom: 1rem;"></i>
            <h3 style="color: #666;">${message}</h3>
        </div>
    `;
    
    searchResults.style.display = 'block';
}

function submitContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        alert(`Thank you, ${name}! Your message has been received. We'll get back to you at ${email} within 24 hours.`);

        event.target.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    let scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) {
        scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.id = 'scrollToTopBtn';
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.className = 'btn btn-primary';
        scrollToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: none;
            transition: all 0.3s ease;
        `;
        scrollToTopBtn.onclick = scrollToTop;
        document.body.appendChild(scrollToTopBtn);
    }
    
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);
    
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            document.querySelectorAll('.result-card, .team-card').forEach(card => {
                observer.observe(card);
            });
        }, 100);
    });
}

initScrollAnimations();

document.addEventListener('DOMContentLoaded', function() {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
});