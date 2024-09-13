import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';

puppeteer.use(stealthPlugin());

const headers = {
    'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet',
    'Content-Type': 'application/json',
};

// Fungsi untuk mendapatkan URL video TikTok
export async function getVideoUrl(videoId) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // URL endpoint API TikTok untuk mendapatkan informasi video
        const videoUrl = `https://api19-core-useast5.us.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}&version_code=262&app_name=musical_ly&channel=App&device_id=null&os_version=14.4.2&device_platform=iphone&device_type=iPhone9`;
        const response = await fetch(videoUrl, { method: 'GET', headers });

        // Cek apakah respons valid
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null;
        }

        const data = await response.text(); // Dapatkan respons sebagai teks
        console.log('API Response:', data); // Log respons untuk debug

        // Parsing JSON jika respons tidak kosong
        const jsonData = JSON.parse(data);
        const videoPlayUrl = jsonData.aweme_list[0]?.video?.play_addr?.url_list[0];

        if (videoPlayUrl) {
            return videoPlayUrl;
        } else {
            console.error('Video URL tidak ditemukan dalam respons API.');
            return null;
        }
    } catch (error) {
        console.error('Error getting video URL:', error.message);
        return null;
    } finally {
        await browser.close();
    }
}
