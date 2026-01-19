/* ============================================
   RefineNovel - Global JavaScript
   ============================================ */

// ============================================
// Dark Mode Toggle
// ============================================

function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) return;
    
    // Get saved theme or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme on page load
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

// ============================================
// Search Functionality (Homepage)
// ============================================

function initSearch(novels) {
    const searchBox = document.getElementById('searchBox');
    const novelGrid = document.getElementById('hotNovels');
    
    if (!searchBox || !novelGrid) return;
    
    searchBox.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        // If query is too short, show all novels
        if (query.length < 2) {
            loadHotNovels(novels, novelGrid);
            return;
        }
        
        // Filter novels by title, author, or genre
        const filtered = novels.filter(novel => 
            novel.title.toLowerCase().includes(query) ||
            (novel.author && novel.author.toLowerCase().includes(query)) ||
            (novel.genres && novel.genres.some(g => g.toLowerCase().includes(query)))
        );
        
        // Display filtered results
        if (filtered.length === 0) {
            novelGrid.innerHTML = '<div class="no-results">No novels found matching "' + query + '"</div>';
        } else {
            loadHotNovels(filtered, novelGrid);
        }
    });
}

// ============================================
// Load Hot Novels (Homepage)
// ============================================

function loadHotNovels(novels, container) {
    if (!container) return;
    
    container.innerHTML = novels.map(novel => `
        <div class="novel-card" onclick="window.location.href='/novels/${novel.id}/'">
            <img src="${novel.cover}" 
                 alt="${novel.title}" 
                 class="novel-cover"
                 onerror="this.src='https://placehold.co/300x400/2c5f7c/white?text=${encodeURIComponent(novel.title)}'">
            <div class="novel-info">
                <div class="novel-title">${novel.title}</div>
                <div class="novel-meta">${novel.chapters} chapters</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// Load Latest Updates (Homepage)
// ============================================

function loadLatestUpdates(novels, container) {
    if (!container) return;
    
    container.innerHTML = novels.map(novel => `
        <div class="update-item" onclick="window.location.href='/novels/${novel.id}/${novel.latestChapter.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}'">
            <div class="update-novel">${novel.title}</div>
            <a href="/novels/${novel.id}/${novel.latestChapter.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}" 
               class="update-chapter"
               onclick="event.stopPropagation()">
                ${novel.latestChapter}
            </a>
            <div class="update-time">${novel.updateTime}</div>
        </div>
    `).join('');
}

// ============================================
// Keyboard Navigation (Chapter Pages)
// ============================================

function initKeyboardNavigation(prevUrl, nextUrl) {
    document.addEventListener('keydown', function(e) {
        // Ignore if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Left arrow - Previous chapter
        if (e.key === 'ArrowLeft' && prevUrl) {
            window.location.href = prevUrl;
        }
        
        // Right arrow - Next chapter
        if (e.key === 'ArrowRight' && nextUrl) {
            window.location.href = nextUrl;
        }
        
        // Up arrow - Scroll to top
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Down arrow - Scroll to bottom
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });
}

// ============================================
// Sort Chapters (Table of Contents)
// ============================================

function sortChapters(order) {
    const list = document.getElementById('chaptersList');
    if (!list) return;
    
    const items = Array.from(list.children);
    
    items.sort((a, b) => {
        const numA = parseInt(a.querySelector('.chapter-number').textContent.match(/\d+/)[0]);
        const numB = parseInt(b.querySelector('.chapter-number').textContent.match(/\d+/)[0]);
        return order === 'asc' ? numA - numB : numB - numA;
    });
    
    // Clear and re-append sorted items
    list.innerHTML = '';
    items.forEach(item => list.appendChild(item));
    
    // Update button states
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ============================================
// Reading Progress Tracker
// ============================================

function initReadingProgress(novelId, chapterNumber) {
    // Save reading position
    if (novelId && chapterNumber) {
        const progress = {
            novelId: novelId,
            chapter: chapterNumber,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`reading_${novelId}`, JSON.stringify(progress));
    }
    
    // Track scroll position for long chapters
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (novelId && chapterNumber) {
                localStorage.setItem(`scroll_${novelId}_${chapterNumber}`, scrollPercent);
            }
        }, 500);
    });
    
    // Restore scroll position on page load
    if (novelId && chapterNumber) {
        const savedScroll = localStorage.getItem(`scroll_${novelId}_${chapterNumber}`);
        if (savedScroll) {
            setTimeout(function() {
                const scrollPosition = (parseFloat(savedScroll) / 100) * (document.body.scrollHeight - window.innerHeight);
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }, 100);
        }
    }
}

// ============================================
// Continue Reading Feature
// ============================================

function getContinueReading() {
    const allProgress = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('reading_')) {
            try {
                const progress = JSON.parse(localStorage.getItem(key));
                allProgress.push(progress);
            } catch (e) {
                // Skip invalid entries
            }
        }
    }
    
    // Sort by most recent
    allProgress.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return allProgress;
}

function displayContinueReading(novels) {
    const continueReading = getContinueReading();
    const container = document.getElementById('continueReading');
    
    if (!container || continueReading.length === 0) return;
    
    const html = continueReading.slice(0, 5).map(progress => {
        const novel = novels.find(n => n.id === progress.novelId);
        if (!novel) return '';
        
        return `
            <div class="novel-card" onclick="window.location.href='/novels/${novel.id}/chapter-${progress.chapter}.html'">
                <img src="${novel.cover}" alt="${novel.title}" class="novel-cover"
                     onerror="this.src='https://placehold.co/300x400/2c5f7c/white?text=${encodeURIComponent(novel.title)}'">
                <div class="novel-info">
                    <div class="novel-title">${novel.title}</div>
                    <div class="novel-meta">Continue from Ch. ${progress.chapter}</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// ============================================
// Font Size Adjustment (Accessibility)
// ============================================

function initFontSizeControls() {
    const currentSize = localStorage.getItem('fontSize') || '1.1';
    const content = document.querySelector('.chapter-content');
    
    if (content) {
        content.style.fontSize = currentSize + 'rem';
    }
    
    // Create font size controls if on chapter page
    if (content) {
        const controls = document.createElement('div');
        controls.className = 'font-controls';
        controls.innerHTML = `
            <button onclick="adjustFontSize(-0.1)">A-</button>
            <button onclick="adjustFontSize(0.1)">A+</button>
            <button onclick="resetFontSize()">Reset</button>
        `;
        
        const header = document.querySelector('.chapter-header');
        if (header) {
            header.appendChild(controls);
        }
    }
}

function adjustFontSize(change) {
    const content = document.querySelector('.chapter-content');
    if (!content) return;
    
    const currentSize = parseFloat(localStorage.getItem('fontSize') || '1.1');
    const newSize = Math.max(0.8, Math.min(2.0, currentSize + change));
    
    content.style.fontSize = newSize + 'rem';
    localStorage.setItem('fontSize', newSize);
}

function resetFontSize() {
    const content = document.querySelector('.chapter-content');
    if (!content) return;
    
    content.style.fontSize = '1.1rem';
    localStorage.setItem('fontSize', '1.1');
}

// ============================================
// Smooth Scroll to Top Button
// ============================================

function initScrollToTop() {
    // Create button
    const button = document.createElement('button');
    button.id = 'scrollToTop';
    button.innerHTML = '↑';
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 99;
        box-shadow: 0 4px 12px var(--shadow);
    `;
    
    document.body.appendChild(button);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            button.style.opacity = '1';
        } else {
            button.style.opacity = '0';
        }
    });
    
    // Scroll to top on click
    button.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// Initialize All Features
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Always initialize dark mode
    initDarkMode();
    
    // Initialize scroll to top button
    initScrollToTop();
    
    // Check if we're on the homepage
    if (document.getElementById('hotNovels')) {
        // Sample data - in production, load from novels.json
        const novels = window.novelsData || [
            {
                id: 'reverend-insanity',
                title: 'Reverend Insanity',
                author: 'Gu Zhen Ren',
                cover: 'https://placehold.co/300x400/2c5f7c/white?text=Reverend+Insanity',
                chapters: 2334,
                genres: ['Fantasy', 'Xuanhuan'],
                latestChapter: 'Chapter 2334: Eternal Life',
                updateTime: '2 hours ago'
            },
            {
                id: 'lord-of-mysteries',
                title: 'Lord of the Mysteries',
                author: 'Cuttlefish That Loves Diving',
                cover: 'https://placehold.co/300x400/4a5f7c/white?text=Lord+of+Mysteries',
                chapters: 1394,
                genres: ['Fantasy', 'Mystery'],
                latestChapter: 'Chapter 1394: End',
                updateTime: '5 hours ago'
            },
            {
                id: 'martial-peak',
                title: 'Martial Peak',
                author: 'Momo',
                cover: 'https://placehold.co/300x400/5c4a7c/white?text=Martial+Peak',
                chapters: 6009,
                genres: ['Action', 'Martial Arts'],
                latestChapter: 'Chapter 6009: Final Battle',
                updateTime: '1 day ago'
            },
            {
                id: 'release-that-witch',
                title: 'Release that Witch',
                author: 'Er Mu',
                cover: 'https://placehold.co/300x400/7c4a5f/white?text=Release+Witch',
                chapters: 1498,
                genres: ['Fantasy', 'Romance'],
                latestChapter: 'Chapter 1498: Epilogue',
                updateTime: '3 hours ago'
            }
        ];
        
        loadHotNovels(novels, document.getElementById('hotNovels'));
        loadLatestUpdates(novels, document.getElementById('latestUpdates'));
        initSearch(novels);
        displayContinueReading(novels);
    }
    
    // Check if we're on a chapter page
    const chapterContent = document.querySelector('.chapter-content');
    if (chapterContent) {
        // Extract novel ID and chapter number from URL or data attributes
        const pathParts = window.location.pathname.split('/');
        const novelId = pathParts[2]; // /novels/novel-id/chapter-1.html
        const chapterFile = pathParts[3];
        const chapterNumber = chapterFile ? parseInt(chapterFile.match(/\d+/)?.[0]) : null;
        
        // Get prev/next URLs from nav buttons
        const prevBtn = document.querySelector('.nav-btn[href*="chapter"]');
        const nextBtn = document.querySelectorAll('.nav-btn[href*="chapter"]')[1];
        const prevUrl = prevBtn && !prevBtn.classList.contains('disabled') ? prevBtn.getAttribute('href') : null;
        const nextUrl = nextBtn && !nextBtn.classList.contains('disabled') ? nextBtn.getAttribute('href') : null;
        
        initKeyboardNavigation(prevUrl, nextUrl);
        initReadingProgress(novelId, chapterNumber);
        initFontSizeControls();
    }
});

// ============================================
// Export functions for use in templates
// ============================================

// Make functions available globally for inline usage
window.sortChapters = sortChapters;
window.adjustFontSize = adjustFontSize;
window.resetFontSize = resetFontSize;
