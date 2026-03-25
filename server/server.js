const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. PostgreSQL DB 연결 풀
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'solkka',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// DB 연결 테스트
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Postgres Connection Error:', err.message);
  } else {
    console.log('✅ Postgres Connected Successfully');
  }
});

// 2. Google Mail (Gmail) SMTP 전송 객체 생성
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 앱 비밀번호 16자리
  },
});

/* ================================
   라우트 (API Endpoints)
================================ */

// 상태 체크 API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Solkka API Server is running!' });
});

// 임시: 인증 코드 전송 요청 
app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: '이메일을 입력해주세요.' });

  // 6자리 임의 코드 생성 로직 (예시)
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Gmail을 이용해 메일 발송
    await transporter.sendMail({
      from: `"Solkka" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '[Solkka] 회원가입 인증 코드',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4c6272;">솔까(Solkka) 인증 코드</h2>
          <p>회원가입을 계속하려면 아래 6자리 인증 코드를 화면에 입력해 주세요.</p>
          <div style="background-color: #f5f3f2; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 5px; color: #313332;">${code}</strong>
          </div>
          <p style="font-size: 12px; color: #7a7b7a;">본인이 요청하지 않은 메일이라면 무시해 주세요.</p>
        </div>
      `,
    });

    // TODO: 생성된 코드를 DB(회원가입 임시 테이블 또는 Redis)에 저장하여 검증 용도로 활용해야 함.
    res.json({ success: true, message: '인증 코드가 전송되었습니다.' });

  } catch (error) {
    console.error('Mail Send Error:', error);
    res.status(500).json({ success: false, message: '메일 발송에 실패했습니다. (환경변수 세팅 확인)' });
  }
});

// 서버 구동
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Solkka Backend is running on http://localhost:${PORT}`);
});
