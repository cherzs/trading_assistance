import { ChartComponent } from './components/Chart.js';
import { ChatBot } from './components/ChatBot.js';

// Inisialisasi chart
document.addEventListener('DOMContentLoaded', () => {
    const chartContainer = document.getElementById('chartContainer');
    if (chartContainer) {
        console.log('Initializing chart...'); // Debug
        const chart = new ChartComponent(chartContainer);
    } else {
        console.error('Chart container not found!'); // Debug
    }

    // Inisialisasi chatbot
    new ChatBot();
}); 