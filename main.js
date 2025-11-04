// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    // Memuat data CSV LOKAL kita
    // Ini akan BERHASIL di GitHub karena filenya kecil!
    Papa.parse("vgsales-8000.csv", {
        download: true, // Beritahu PapaParse untuk mengunduh file
        header: true,   // Anggap baris pertama sebagai header (nama kolom)
        dynamicTyping: true, // Otomatis ubah angka dari teks jadi angka
        delimiter: ";", // INI PENTING! Data Anda menggunakan titik koma
        skipEmptyLines: true,
        complete: (results) => {
            // Data berhasil dimuat!
            console.log("Data berhasil dimuat:", results.data);
            
            // Sekarang, panggil fungsi untuk menggambar setiap grafik
            createBarChart(results.data);
            createLineChart(results.data);
            createPieChart(results.data);
        },
        error: (err) => {
            console.error("Gagal memuat atau mem-parse CSV:", err);
        }
    });
});

/**
 * 1. VISUALISASI GRAFIK BATANG (BAR CHART)
 * Menampilkan Top 10 Genre berdasarkan Penjualan Global
 */
function createBarChart(data) {
    const genreSales = {};
    data.forEach(row => {
        if (row.Genre && row.Global_Sales) {
            if (genreSales[row.Genre]) {
                genreSales[row.Genre] += row.Global_Sales;
            } else {
                genreSales[row.Genre] = row.Global_Sales;
            }
        }
    });
    const sortedGenres = Object.entries(genreSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
    const labels = sortedGenres.map(item => item[0]);
    const values = sortedGenres.map(item => item[1].toFixed(2));
    const ctx = document.getElementById('chart1').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Penjualan Global (dalam Juta)',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: { responsive: true, indexAxis: 'y', scales: { x: { beginAtZero: true } } }
    });
}

/**
 * 2. VISUALISASI GRAFIK GARIS (LINE CHART)
 * Menampilkan Tren Penjualan Global per Tahun
 */
function createLineChart(data) {
    const yearSales = {};
    data.forEach(row => {
        if (row.Year && row.Global_Sales && row.Year < 2017) {
            const year = Math.floor(row.Year);
            if (yearSales[year]) {
                yearSales[year] += row.Global_Sales;
            } else {
                yearSales[year] = row.Global_Sales;
            }
        }
    });
    const labels = Object.keys(yearSales).sort();
    const values = labels.map(year => yearSales[year].toFixed(2));
    const ctx = document.getElementById('chart2').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Penjualan Global (dalam Juta)',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

/**
 * 3. VISUALISASI GRAFIK PIE (PIE CHART)
 * Menampilkan Komposisi Pasar Regional
 */
function createPieChart(data) {
    let totalNA = 0, totalEU = 0, totalJP = 0, totalOther = 0;
    data.forEach(row => {
        totalNA += row.NA_Sales || 0;
        totalEU += row.EU_Sales || 0;
        totalJP += row.JP_Sales || 0;
        totalOther += row.Other_Sales || 0;
    });
    const totalSales = [totalNA, totalEU, totalJP, totalOther];
    const ctx = document.getElementById('chart3').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Amerika Utara (NA)', 'Eropa (EU)', 'Jepang (JP)', 'Wilayah Lain (Other)'],
            datasets: [{
                label: 'Total Penjualan',
                data: totalSales,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let sum = context.dataset.data.reduce((a, b) => a + b, 0);
                            let percentage = (context.raw / sum * 100).toFixed(2);
                            return `${context.label}: ${context.raw.toFixed(2)} Juta (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}