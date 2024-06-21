import axios from 'axios';
import rateLimit from 'express-rate-limit';

// Tạo bộ giới hạn tần suất với custom key generator
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // giới hạn mỗi IP đến 100 yêu cầu mỗi 15 phút
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  }
});

// Danh sách User-Agent đã được kiểm tra
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
];

// Hàm lấy ngẫu nhiên User-Agent
const getRandomUserAgent = () => {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
};

// Hàm delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const shopeexuHandler = async (req, res) => {
  const startTime = Date.now(); // Timestamp hiện tại
  console.log('Handler started');
  
  try {
    // Delay ngẫu nhiên từ 1 đến 3 giây
    await delay(Math.floor(Math.random() * 2000) + 1000);
    console.log('Delay complete');

    const response = await axios.get('https://api.chietkhau.pro/api/v1/shopeexu/all_spinner', {
      params: {
        limit: 20,
        'startTime[gte]': startTime,
      },
      headers: {
        'Referer': 'https://shopeexu-nextjs.vercel.app',
        'Origin': 'https://shopeexu-nextjs.vercel.app',
        'User-Agent': getRandomUserAgent(), // Sử dụng User-Agent ngẫu nhiên
      },
    });

    console.log('API call successful', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request data:', error.request);
    }
    res.status(500).send('Internal Server Error');
  }
};

// Middleware áp dụng giới hạn tần suất
const handler = async (req, res) => {
  console.log('Rate limiter middleware');
  await new Promise((resolve, reject) => {
    limiter(req, res, (result) => {
      if (result instanceof Error) {
        console.error('Rate limit error', result);
        return reject(result);
      }
      resolve(result);
    });
  });

  await shopeexuHandler(req, res);
};

export default handler;
