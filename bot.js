// Import dependencies
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Memuat variabel lingkungan dari file .env

// Inisialisasi API Key dan GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Pastikan API Key benar
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'client-one-nugi', // Identifikator klien
    }),
});

// Fungsi untuk memeriksa respons khusus
function customResponse(prompt) {
    const keywords = {
        'warna kesukaan nahe': 'Warna kesukaan Nahe adalah pink?',
        'makanan favorit nahe': 'Makanan favorit Nahe adalah... gatau',
        'siapa rutap': 'anak voli bde',
        'siapa nugi': 'yang program ini bot :v',
        'siapa farel': 'ketosnya budut, tapi mau mi punah',
        'siapa fadil': 'boss muda!',
        'apa itu bumakscup': 'eventnya budut',
    };

    for (let keyword in keywords) {
        if (prompt.toLowerCase().includes(keyword)) {
            return keywords[keyword];
        }
    }
    return null;
}

// Daftar kalimat roasting manual
const roastingResponses = [
    "Izin terusss",
    "Kemarin izin sekarang izin lagi, ga bisa tepat waktu dek?",
    "Izin mlu, sudah osis telat lagi",
    "Izin? bilang mko telat ko bangun.. jangan yah dek yahh",
    "Sakit? sakit pagi ji itu siang sore malam sehat mi.. xixixi"
];

// Fungsi untuk mengambil kalimat roasting manual secara acak
function getRandomRoasting() {
    return roastingResponses[Math.floor(Math.random() * roastingResponses.length)];
}

// Fungsi asinkron untuk menghasilkan roasting kasar menggunakan AI
async function generateRoasting(name) {
    try {
        const prompt = `roastinglah ${name} dalam bahasa gaul dan singkat. tanpa memberikan penjelasan,disclaimer.`;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-exp-0827' });
        const result = await model.generateContent(prompt);
        const roastingText = result.response.text(); // Sesuaikan dengan struktur hasil dari model
        // Hilangkan keterangan tambahan jika ada
        return roastingText.replace(/(?<=roasting:)(.*?)(?=Explanation:)/s, '').trim();
    } catch (error) {
        console.error('Error generating roasting:', error.message);
        return `Waduh, saya tidak bisa memberikan roasting untuk si ${name} kali ini karna terlalu kasar.`;
    }
}

// Fungsi asinkron untuk menghasilkan konten menggunakan AI
async function generateContent(prompt) {
    try {
        console.log("Prompt yang dikirim ke AI:", prompt); // Logging untuk debugging

        const customReply = customResponse(prompt);
        if (customReply) return customReply;

        if (prompt.toLowerCase().includes('/nahe')) {
            // Prompt khusus untuk /nahe
            const specialPrompt = `Nahe ituu dia itu cantik, baik, lucu, comel, juga suka warna pink, makanan kesukaanya saya tidak tau, tapi kalo liat dia itu hati jadi lebih tenang gituu.`;
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-exp-0827' });
            const result = await model.generateContent(specialPrompt);
            console.log("Hasil dari model AI untuk /nahe:", result); // Logging hasil
            return result.response.text(); // Pastikan ini sesuai dengan struktur hasil dari model
        }

        // Prompt untuk perintah /tanya dalam bahasa Indonesia
        const indonesianPrompt = `Jawab pertanyaan berikut dalam bahasa Indonesia: ${prompt}`;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-exp-0827' });
        const result = await model.generateContent(indonesianPrompt);
        console.log("Hasil dari model AI untuk /tanya:", result); // Logging hasil
        return result.response.text(); // Pastikan ini sesuai dengan struktur hasil dari model
    } catch (error) {
        console.error('Error generating content:', error.message);
        return 'Kalo masukin pertanyaan yang normal normal aja.';
    }
}

// Fungsi untuk mengirim stiker
async function sendSticker(chatId, imagePath) {
    try {
        const media = MessageMedia.fromFilePath(imagePath);
        await client.sendMessage(chatId, media, { sendMediaAsSticker: true });
        console.log('Stiker dikirim!');
    } catch (error) {
        console.error('Error sending sticker:', error.message);
    }
}

// Fungsi untuk memproses gambar yang diterima dengan perintah /stiker
async function processImageAsSticker(message) {
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const filePath = path.join(__dirname, 'temp_image.jpg');

        fs.writeFileSync(filePath, media.data, 'base64'); // Simpan gambar sementara

        await sendSticker(message.from, filePath);

        fs.unlinkSync(filePath); // Hapus file sementara setelah dikirim
    } else {
        message.reply('Silakan kirim gambar setelah mengetik /stiker.');
    }
}

// Fungsi untuk memberikan informasi tentang pembuat bot
function provideInfo(message) {
    const info = "Bot ini dibuat oleh Nugi eaa.";
    message.reply(info);
}

// Fungsi untuk menampilkan daftar fitur umum
function provideMenu(message) {
    const menu = `*Fitur yang tersedia:*
1. /tanya <pertanyaan> - Menanyakan pertanyaan apapun.
2. /info - Menampilkan informasi tentang pembuat bot.
3. /stiker - Mengubah gambar yang dikirim menjadi stiker.
4. /menu - Menampilkan daftar fitur umum.
5. /menuKhusus - Menampilkan daftar keyword khusus yang didukung.
6. /roast <nama> - Membuat roasting otomatis menggunakan AI pada nama yang diberikan.

Contoh penggunaan: 
- /tanya siapa presiden Indonesia saat ini
- /tanya dimana letak Australia`;
    message.reply(menu);
}

// Fungsi untuk menampilkan daftar keyword khusus
function provideMenuKhusus(message) {
    const menuKhusus = `*Keyword khusus yang tersedia:*
1. /tanya warna kesukaan nahe - Menampilkan warna kesukaan Nahe.
2. /tanya makanan favorit nahe - Menampilkan makanan favorit Nahe.
3. /tanya siapa nugi - Menampilkan informasi tentang Nugi.
4. /tanya siapa rutap - Menampilkan informasi tentang Rutap.
5. /tanya siapa farel - Menampilkan informasi tentang Farel.
6. /tanya siapa fadil - Menampilkan informasi tentang Fadil.
7. /tanya apa itu bumakscup - Menampilkan informasi tentang Bumakscup.

Silakan gunakan sesuai kebutuhan!`;
    message.reply(menuKhusus);
}

// Fungsi untuk memeriksa kata kunci 'izin' dalam pesan
function checkIzin(message) {
    if (message.body.toLowerCase().includes('izin')) {
        const roastingReply = getRandomRoasting();
        message.reply(roastingReply);
    }
}

// Inisialisasi klien WhatsApp
client.initialize();

// Event listener untuk QR Code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Event listener ketika klien siap
client.on('ready', () => {
    console.log('WhatsApp bot siap!');
});

// Event listener untuk pesan
client.on('message', async (message) => {
    // Tambahkan log untuk debugging
    console.log(`Pesan diterima: ${message.body}`);
    console.log(`Pesan dari grup: ${message.chat ? message.chat.isGroup : 'Tidak dapat mengakses chat'}`);

    // Tambahkan logging lebih lanjut untuk chat
    console.log(`Informasi chat: ${JSON.stringify(message.chat)}`);

    // Tangani perintah khusus
    if (message.body.startsWith('/tanya')) {
        const prompt = message.body.slice(6).trim(); // Ambil pertanyaan setelah perintah
        const response = await generateContent(prompt);
        message.reply(response);
    } else if (message.body === '/info') {
        provideInfo(message);
    } else if (message.body === '/menu') {
        provideMenu(message);
    } else if (message.body === '/menuKhusus') {
        provideMenuKhusus(message);
    } else if (message.body.startsWith('/stiker')) {
        await processImageAsSticker(message);
    } else if (message.body.startsWith('/roast')) {
        const name = message.body.slice(6).trim(); // Ambil nama setelah perintah
        const roasting = await generateRoasting(name);
        message.reply(roasting);
    } else if (message.body.startsWith('/nahe')) {
        const response = await generateContent(message.body);
        message.reply(response);
    } else {
        // Cek kata kunci 'izin' jika tidak ada perintah khusus
        checkIzin(message);
    }
});
