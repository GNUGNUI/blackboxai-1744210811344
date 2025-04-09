class StorageManager {
    constructor() {
        // Initialize storage
        this.songs = JSON.parse(localStorage.getItem('songs')) || [];
        this.audioData = JSON.parse(localStorage.getItem('audioData')) || {};

        // Initialize with sample data if no songs exist
        if (this.songs.length === 0) {
            const sampleSongs = [
                {
                    id: '1',
                    name: 'Amazing Grace',
                    composer: 'John Newton',
                    lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me.\nI once was lost, but now am found,\nWas blind, but now I see.',
                    tags: ['hymn', 'classic', 'worship'],
                    date: new Date('2024-01-01').toISOString(),
                    demoText: 'Demo song'
                },
                {
                    id: '2',
                    name: 'How Great Thou Art',
                    composer: 'Carl Boberg',
                    lyrics: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.',
                    tags: ['hymn', 'worship', 'traditional'],
                    date: new Date('2024-01-02').toISOString(),
                    demoText: 'Demo song'
                },
                {
                    id: '3',
                    name: 'It Is Well',
                    composer: 'Horatio Spafford',
                    lyrics: 'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll,\nWhatever my lot, Thou hast taught me to say,\nIt is well, it is well with my soul.',
                    tags: ['hymn', 'peace', 'classic'],
                    date: new Date('2024-01-03').toISOString(),
                    demoText: 'Demo song'
                }
            ];
            this.songs = sampleSongs;
            this.saveSongs();
        }
    }

    // Save songs to localStorage
    saveSongs() {
        localStorage.setItem('songs', JSON.stringify(this.songs));
        localStorage.setItem('audioData', JSON.stringify(this.audioData));
    }

    // Add new song
    addSong(song, audioData = null) {
        song.id = Date.now().toString();
        song.date = new Date().toISOString();
        song.tags = typeof song.tags === 'string' ? 
            song.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
            song.tags;
        song.demoText = song.demoText || 'Demo song';
        
        if (audioData) {
            this.audioData[song.id] = audioData;
        }
        
        this.songs.push(song);
        this.saveSongs();
        return song;
    }

    // Get all songs
    getAllSongs() {
        return this.songs;
    }

    // Get song by ID
    getSong(id) {
        const song = this.songs.find(song => song.id === id);
        if (song) {
            song.audioData = this.audioData[id] || null;
        }
        return song;
    }

    // Update song
    updateSong(id, updatedSong) {
        const index = this.songs.findIndex(song => song.id === id);
        if (index !== -1) {
            // Keep existing song data that shouldn't be overwritten
            const existingSong = this.songs[index];
            
            // Ensure tags are in array format
            const tags = typeof updatedSong.tags === 'string' ? 
                updatedSong.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
                updatedSong.tags;

            // Update the song with new data while preserving the ID and date
            this.songs[index] = {
                ...existingSong,
                ...updatedSong,
                id: existingSong.id,
                date: existingSong.date,
                tags: tags,
                demoText: updatedSong.demoText || existingSong.demoText || 'Demo song',
                lastModified: new Date().toISOString()
            };
            
            this.saveSongs();
            return true;
        }
        return false;
    }

    // Delete song
    deleteSong(id) {
        const index = this.songs.findIndex(song => song.id === id);
        if (index !== -1) {
            this.songs.splice(index, 1);
            delete this.audioData[id];
            this.saveSongs();
            return true;
        }
        return false;
    }

    // Search songs
    searchSongs(query, sortBy = 'az', tags = []) {
        let filteredSongs = [...this.songs];

        // Search by query
        if (query) {
            const searchQuery = query.toLowerCase();
            filteredSongs = filteredSongs.filter(song => 
                song.name.toLowerCase().includes(searchQuery) ||
                song.composer.toLowerCase().includes(searchQuery) ||
                song.lyrics.toLowerCase().includes(searchQuery) ||
                song.tags.some(tag => tag.toLowerCase().includes(searchQuery))
            );
        }

        // Filter by tags
        if (tags.length > 0) {
            filteredSongs = filteredSongs.filter(song => 
                tags.some(searchTag => 
                    song.tags.some(songTag => 
                        songTag.toLowerCase().includes(searchTag.toLowerCase())
                    )
                )
            );
        }

        // Sort results
        switch (sortBy) {
            case 'za':
                filteredSongs.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                filteredSongs.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                filteredSongs.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            default: // 'az'
                filteredSongs.sort((a, b) => a.name.localeCompare(b.name));
        }

        return filteredSongs;
    }

    // Get all unique tags
    getAllTags() {
        const tagSet = new Set();
        this.songs.forEach(song => {
            song.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }

    // Handle audio data
    getAudioData(songId) {
        return this.audioData[songId] || null;
    }

    // Update audio data
    updateAudioData(songId, audioData) {
        this.audioData[songId] = audioData;
        this.saveSongs();
    }
}

// Create a single instance of StorageManager
const storage = new StorageManager();
