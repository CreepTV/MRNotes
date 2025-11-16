// ========================================
// MRNotes Roadmap - Interactive Features
// ========================================

// Toggle card animation
function toggleCard(card) {
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = '';
    }, 100);
}

// Update progress for all phases
function updateProgress() {
    // Phase 1
    const phase1Tasks = ['task1', 'task2', 'task3'];
    updatePhaseProgress(phase1Tasks, 'phase1');

    // Phase 2
    const phase2Tasks = ['task4', 'task5', 'task6'];
    updatePhaseProgress(phase2Tasks, 'phase2');

    // Phase 3
    const phase3Tasks = ['task7', 'task8', 'task9'];
    updatePhaseProgress(phase3Tasks, 'phase3');

    // Phase 4
    const phase4Tasks = ['task10', 'task11', 'task12', 'task13'];
    updatePhaseProgress(phase4Tasks, 'phase4');

    // Update card completed state
    updateCardStates();

    // Save progress
    saveProgress();
}

// Update progress for a specific phase
function updatePhaseProgress(tasks, phaseId) {
    const completed = tasks.filter(id => {
        const checkbox = document.getElementById(id);
        return checkbox && checkbox.checked;
    }).length;
    
    const percent = Math.round((completed / tasks.length) * 100);
    
    const progressFill = document.getElementById(`${phaseId}-progress`);
    const progressText = document.getElementById(`${phaseId}-percent`);
    
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressText) progressText.textContent = percent + '%';
}

// Update card completed states
function updateCardStates() {
    document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]').forEach(checkbox => {
        const card = checkbox.closest('.card');
        if (card) {
            if (checkbox.checked) {
                card.classList.add('completed');
            } else {
                card.classList.remove('completed');
            }
        }
    });
}

// Save progress to localStorage
function saveProgress() {
    const allTasks = ['task1', 'task2', 'task3', 'task4', 'task5', 'task6', 
                      'task7', 'task8', 'task9', 'task10', 'task11', 'task12', 'task13'];
    const progress = {};
    
    allTasks.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            progress[id] = checkbox.checked;
        }
    });
    
    localStorage.setItem('mrnotes-progress', JSON.stringify(progress));
    
    // Also save timestamp
    localStorage.setItem('mrnotes-progress-timestamp', new Date().toISOString());
}

// Load progress from localStorage
function loadProgress() {
    const savedProgress = localStorage.getItem('mrnotes-progress');
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            Object.keys(progress).forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    checkbox.checked = progress[id];
                }
            });
            updateProgress();
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

// Smooth drag scrolling for board
function initDragScroll() {
    const boardContainer = document.querySelector('.board-container');
    if (!boardContainer) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
        // Don't drag if clicking on a card or input
        if (e.target.closest('.card') || e.target.closest('input') || e.target.closest('label')) {
            return;
        }
        
        isDown = true;
        boardContainer.classList.add('grabbing');
        startX = e.pageX - boardContainer.offsetLeft;
        scrollLeft = boardContainer.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown = false;
        boardContainer.classList.remove('grabbing');
    };

    const handleMouseUp = () => {
        isDown = false;
        boardContainer.classList.remove('grabbing');
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - boardContainer.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        boardContainer.scrollLeft = scrollLeft - walk;
    };

    boardContainer.addEventListener('mousedown', handleMouseDown);
    boardContainer.addEventListener('mouseleave', handleMouseLeave);
    boardContainer.addEventListener('mouseup', handleMouseUp);
    boardContainer.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Cleanup function for when page unloads or visibility changes
    const cleanup = () => {
        boardContainer.removeEventListener('mousedown', handleMouseDown);
        boardContainer.removeEventListener('mouseleave', handleMouseLeave);
        boardContainer.removeEventListener('mouseup', handleMouseUp);
        boardContainer.removeEventListener('mousemove', handleMouseMove, { passive: true });
    };

    // Cleanup on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isDown = false;
            boardContainer.classList.remove('grabbing');
        }
    });

    // Store cleanup function for potential later use
    window.__cleanupDragScroll = cleanup;
}

// Add keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + R: Reset all progress
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            if (confirm('Möchten Sie wirklich den gesamten Fortschritt zurücksetzen?')) {
                resetProgress();
            }
        }
        
        // Alt + S: Save screenshot (opens print dialog)
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            window.print();
        }
    });
}

// Reset all progress
function resetProgress() {
    const allCheckboxes = document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateProgress();
    localStorage.removeItem('mrnotes-progress');
    localStorage.removeItem('mrnotes-progress-timestamp');
}

// Show progress statistics
function showStatistics() {
    const allTasks = document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]');
    const completedTasks = Array.from(allTasks).filter(cb => cb.checked).length;
    const totalTasks = allTasks.length;
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    
    console.log('📊 Roadmap Statistics:');
    console.log(`Total Tasks: ${totalTasks}`);
    console.log(`Completed: ${completedTasks}`);
    console.log(`Remaining: ${totalTasks - completedTasks}`);
    console.log(`Progress: ${percentage}%`);
    
    const timestamp = localStorage.getItem('mrnotes-progress-timestamp');
    if (timestamp) {
        console.log(`Last Updated: ${new Date(timestamp).toLocaleString('de-DE')}`);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load saved progress
    loadProgress();
    
    // Initialize drag scrolling
    initDragScroll();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Log welcome message
    console.log('%c🚀 MRNotes Roadmap geladen!', 'color: #667eea; font-size: 16px; font-weight: bold;');
    console.log('%cTastenkombinationen:', 'color: #764ba2; font-weight: bold;');
    console.log('  Alt + R: Fortschritt zurücksetzen');
    console.log('  Alt + S: Roadmap drucken/speichern');
    console.log('\nFunktionen:');
    console.log('  showStatistics(): Zeigt Fortschritts-Statistiken');
    console.log('  resetProgress(): Setzt den Fortschritt zurück');
    
    // Add animation observer for fade-in effects
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
});

// Export functions for console access
window.showStatistics = showStatistics;
window.resetProgress = resetProgress;
window.updateProgress = updateProgress;
