document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    const tagSearchBtn = document.getElementById('tagSearchBtn');
    const viewToggle = document.getElementById('viewToggle');
    const songsList = document.getElementById('songsList');
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const closeAdminModal = document.getElementById('closeAdminModal');

    let isGridView = localStorage.getItem('viewMode') === 'grid';
    let currentTags = [];

    // Set default theme if none exists
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'softSky');
        applyTheme('softSky');
    }

    // Initialize view
    updateViewMode();
    renderSongs();

    // Search and filter handlers
    searchInput.addEventListener('input', renderSongs);
    sortFilter.addEventListener('change', renderSongs);

    // View toggle
    viewToggle.addEventListener('click', () => {
        isGridView = !isGridView;
        localStorage.setItem('viewMode', isGridView ? 'grid' : 'list');
        updateViewMode();
        renderSongs();
    });

    // Admin login
    adminBtn.addEventListener('click', () => {
        if (adminModal) {
            adminModal.classList.remove('hidden');
            adminModal.classList.add('flex');
            requestAnimationFrame(() => {
                const modalContent = adminModal.querySelector('.modal-content');
                modalContent.classList.remove('opacity-0', 'translate-y-4');
            });
        }
    });

    const closeModal = () => {
        const modalContent = adminModal.querySelector('.modal-content');
        modalContent.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => {
            adminModal.classList.remove('flex');
            adminModal.classList.add('hidden');
        }, 300);
    };

    closeAdminModal.addEventListener('click', closeModal);

    // Close modal when clicking outside
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            closeModal();
        }
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (email === 'maxyrocs01@gmail.com' && password === 'maxyrocs01@gmail.com') {
            localStorage.setItem('adminAuth', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Invalid credentials');
        }
    });

    // Tag search
    tagSearchBtn.addEventListener('click', () => {
        const allTags = storage.getAllTags();
        if (allTags.length === 0) {
            alert('No tags available');
            return;
        }

        const tagList = document.createElement('div');
        tagList.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        tagList.innerHTML = `
            <div class="modal-content bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-11/12 max-w-md transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-semibold theme-text">Select Tags</h3>
                        <p class="theme-text opacity-60 text-sm">Filter songs by tags</p>
                    </div>
                    <button class="p-2 rounded-full transition-all duration-300" id="closeTagModal" data-accent>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${allTags.map(tag => `
                        <button class="tag-btn px-3 py-1 rounded-full transition-all duration-300 ${
                            currentTags.includes(tag) ? 'theme-button' : 'bg-black/5 theme-text'
                        }" data-tag="${tag}">
                            ${tag}
                        </button>
                    `).join('')}
                </div>
                <button id="applyTagFilters" class="w-full theme-button py-2 px-4 rounded-md transition-all duration-300">
                    Apply Filters
                </button>
            </div>
        `;

        document.body.appendChild(tagList);

        // Tag selection
        const tagButtons = tagList.querySelectorAll('.tag-btn');
        tagButtons.forEach(btn => {
            const updateTagButton = (btn, isSelected) => {
                if (isSelected) {
                    btn.classList.remove('bg-black/5', 'theme-text');
                    btn.classList.add('theme-button');
                } else {
                    btn.classList.remove('theme-button');
                    btn.classList.add('bg-black/5', 'theme-text');
                }
            };

            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                const isSelected = currentTags.includes(tag);
                
                if (isSelected) {
                    currentTags = currentTags.filter(t => t !== tag);
                } else {
                    currentTags.push(tag);
                }
                
                updateTagButton(btn, !isSelected);
            });
        });

        // Close modal
        const closeBtn = tagList.querySelector('#closeTagModal');
        closeBtn.addEventListener('click', () => {
            currentTags = []; // Reset tags when closing without applying
            tagList.remove();
            renderSongs();
        });

        // Apply filters
        document.getElementById('applyTagFilters').addEventListener('click', () => {
            if (currentTags.length > 0) {
                renderSongs();
            }
            tagList.remove();
        });
    });

    function updateViewMode() {
        viewToggle.innerHTML = isGridView ? 
            '<i class="fas fa-list"></i>' : 
            '<i class="fas fa-th-large"></i>';
        
        songsList.className = isGridView ?
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
            'space-y-4';
    }

    function renderSongs() {
        const query = searchInput.value;
        const sortBy = sortFilter.value;
        const songs = storage.searchSongs(query, sortBy, currentTags);

        songsList.innerHTML = '';

        if (songs.length === 0) {
            songsList.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-music text-4xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">No songs found</p>
                </div>
            `;
            return;
        }

        songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = isGridView ?
                'song-card bg-white/95 backdrop-blur-sm rounded-xl p-4 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-lg hover:shadow-xl' :
                'song-card bg-white/95 backdrop-blur-sm rounded-xl p-4 cursor-pointer transition-all duration-300 flex gap-4 items-center shadow-lg hover:shadow-xl';

            const audioData = storage.getAudioData(song.id);
            const hasAudio = audioData !== null;
            
            songElement.innerHTML = `
                <div class="${isGridView ? '' : 'flex-1'}">
                    <h3 class="font-semibold text-lg mb-1 theme-text">${song.name}</h3>
                    <p class="theme-text opacity-60 text-sm mb-2">${song.composer}</p>
                    <div class="flex flex-wrap gap-1 mb-2">
                        ${song.tags.map(tag => `
                            <span class="text-xs px-2 py-1 bg-black/5 backdrop-blur-sm rounded-full theme-text">${tag}</span>
                        `).join('')}
                    </div>
                    <div class="flex items-center gap-2 text-sm theme-text opacity-60">
                        ${hasAudio ? `<i class="fas fa-${audioData.type === 'youtube' ? 'youtube' : 'music'}" data-accent></i>` : ''}
                    </div>
                </div>
            `;

            songElement.addEventListener('click', () => showSongDetails(song));
            songsList.appendChild(songElement);
        });
    }

    function showSongDetails(song) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50';
        
        const audioData = storage.getAudioData(song.id);
        let audioContent = '';

        if (audioData) {
            if (audioData.type === 'youtube') {
                const videoId = storage.getYouTubeVideoId(audioData.data);
                audioContent = `
                    <div class="bg-white/50 rounded-lg p-4 shadow-inner">
                        <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
                            gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                `;
            } else if (audioData.type === 'url') {
                audioContent = `
                    <div class="bg-white/50 rounded-lg p-4 shadow-inner">
                        <audio controls class="w-full">
                            <source src="${audioData.data}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                `;
            } else {
                audioContent = `
                    <div class="bg-white/50 rounded-lg p-4 shadow-inner">
                        <audio controls class="w-full">
                            <source src="${audioData.data}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                `;
            }
        } else {
            audioContent = `
                <div class="text-center py-6 bg-white/50 rounded-lg shadow-inner">
                    <i class="fas fa-volume-mute text-3xl mb-3 theme-text opacity-60"></i>
                    <p class="text-sm theme-text opacity-60">No audio available for this song</p>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content bg-white/95 backdrop-blur-xl rounded-2xl p-8 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transform hover:-translate-y-1">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold theme-text">${song.name}</h2>
                    <button class="p-2 rounded-full transition-all duration-300 hover:rotate-90" id="closeSongModal" data-accent>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-8">
                    <div class="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-xl p-6 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <h3 class="text-sm font-medium theme-text opacity-60 uppercase tracking-wider">Composer</h3>
                        <p class="text-xl theme-text mt-2 font-semibold">${song.composer}</p>
                    </div>
                    <div class="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-xl p-6 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div class="flex flex-col">
                            <p class="text-sm theme-text opacity-60 mb-2">${song.demoText || 'Demo song'}</p>
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-sm font-medium theme-text opacity-60 uppercase tracking-wider">Audio Player</h3>
                                <i class="fas fa-${audioData?.type === 'youtube' ? 'youtube' : 'music'} text-xl" data-accent></i>
                            </div>
                        </div>
                        ${audioContent}
                    </div>
                    <div class="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-xl p-6 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <h3 class="text-sm font-medium theme-text opacity-60 uppercase tracking-wider mb-4">Lyrics</h3>
                        <pre class="whitespace-pre-wrap font-poppins theme-text text-lg leading-relaxed bg-white/50 rounded-lg p-6 shadow-inner">${song.lyrics}</pre>
                    </div>
                    <div class="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-xl p-6 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <h3 class="text-sm font-medium theme-text opacity-60 uppercase tracking-wider mb-4">Tags</h3>
                        <div class="flex flex-wrap gap-2">
                            ${song.tags.map(tag => `
                                <span class="px-4 py-2 rounded-full text-sm theme-text bg-white/70 backdrop-blur-xl shadow-sm transform transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal with fade-out animation
        const closeModal = () => {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => modal.remove(), 300);
        };

        // Close modal
        document.getElementById('closeSongModal').addEventListener('click', closeModal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Add entrance animation
        requestAnimationFrame(() => {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                modalContent.style.transition = 'all 0.3s ease-out';
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'translateY(0)';
            });
        });
    }
});
