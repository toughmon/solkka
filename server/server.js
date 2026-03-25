const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
  ssl: { rejectUnauthorized: false }
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

  // 6자리 임의 코드 및 만료시간(5분 뒤) 생성
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60000);

  try {
    // 1. 동일 이메일의 기존 인증 코드가 있다면 덮어쓰기 위해 삭제
    await pool.query('DELETE FROM solkka.email_verification WHERE email = $1', [email]);
    
    // 2. 새 인증 번호를 DB에 저장
    await pool.query(
      'INSERT INTO solkka.email_verification (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    // 3. Gmail을 이용해 메일 발송
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

    res.json({ success: true, message: '인증 코드가 전송되었습니다.' });

  } catch (error) {
    console.error('Mail Send Error:', error);
    res.status(500).json({ success: false, message: '메일 발송에 실패했습니다. (환경변수 세팅 확인)' });
  }
});

// 2. 인증 코드 검증 및 최종 회원가입 처리 API
app.post('/api/auth/verify', async (req, res) => {
  const { email, code, password } = req.body;

  if (!email || !code || !password) {
    return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
  }

  try {
    // 1. 해당 이메일의 최신 인증 코드 조회
    const result = await pool.query(
      'SELECT code, expires_at FROM solkka.email_verification WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: '요청된 인증 코드가 없습니다. 다시 요청해 주세요.' });
    }

    const { code: dbCode, expires_at } = result.rows[0];

    // 2. 만료 시간 및 코드 일치 여부 확인
    if (new Date() > expires_at) {
      return res.status(400).json({ success: false, message: '인증 코드가 만료되었습니다. 다시 요청해 주세요.' });
    }
    if (dbCode !== code) {
      return res.status(400).json({ success: false, message: '인증 코드가 일치하지 않습니다.' });
    }

    // 3. 회원가입: 비밀번호 해싱 및 닉네임 생성 (임시 평문 암호, 추후 bcrypt 적용)
    // 알파벳+숫자 8자리 익명 닉네임 생성
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomNickname = '';
    for (let i = 0; i < 8; i++) {
        randomNickname += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // (단방향 암호화: bcrypt를 이용한 패스워드 해싱, salt rounds = 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. user_account 테이블에 영구 저장
    await pool.query(
      'INSERT INTO solkka.user_account (email, password_hash, nickname) VALUES ($1, $2, $3)',
      [email, passwordHash, randomNickname]
    );

    // 5. 사용된 인증 코드 파기
    await pool.query('DELETE FROM solkka.email_verification WHERE email = $1', [email]);

    res.json({ success: true, message: '회원가입이 성공적으로 완료되었습니다!', nickname: randomNickname });

  } catch (error) {
    console.error('Verify & Signup Error:', error);
    // 중복 이메일 체크 (Unique 제약조건 위반 - error.code === '23505')
    if (error.code === '23505') {
       return res.status(400).json({ success: false, message: '이미 가입된 이메일 계정입니다.' });
    }
    res.status(500).json({ success: false, message: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

// 3. 로그인 API
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, nickname FROM solkka.user_account WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: '가입되지 않은 이메일이거나 비밀번호가 틀렸습니다.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: '가입되지 않은 이메일이거나 비밀번호가 틀렸습니다.' });
    }

    // TODO: JWT 토큰 발급 또는 세션 처리. 임시로 성공 메시지만 넘김
    res.json({ 
      success: true, 
      message: '로그인 성공', 
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: '로그인 처리 중 서버 오류가 발생했습니다.' });
  }
});

/* ================================
   게시글(Post) 관련 API
================================ */

// 1. 카테고리 목록 조회
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description FROM solkka.category ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Categories Error:', error);
    res.status(500).json({ message: '카테고리 정보를 가져오지 못했습니다.' });
  }
});

// 2. 게시글 작성
app.post('/api/posts', async (req, res) => {
  const { user_account_id, category_id, title, content, is_counseling_requested } = req.body;

  if (!category_id || !title || !content) {
    return res.status(400).json({ message: '카테고리, 제목, 본문은 필수 입력 사항입니다.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO solkka.post 
       (user_account_id, category_id, title, content, is_counseling_requested) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [user_account_id || null, category_id, title, content, is_counseling_requested || false]
    );

    res.json({ success: true, message: '게시글이 성공적으로 등록되었습니다.', postId: result.rows[0].id });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ success: false, message: '게시글 등록 중 오류가 발생했습니다.' });
  }
});

// 3. 게시글 목록 조회
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.view_count, 
        p.like_count, 
        p.is_counseling_requested,
        p.created_at,
        c.name as category_name
      FROM solkka.post p
      JOIN solkka.category c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    res.status(500).json({ message: '게시글 목록을 가져오지 못했습니다.' });
  }
});

// 4. 단일 게시글 상세 조회
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        c.name as category_name,
        u.nickname as author_nickname
      FROM solkka.post p
      JOIN solkka.category c ON p.category_id = c.id
      LEFT JOIN solkka.user_account u ON p.user_account_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch Post Detail Error:', error);
    res.status(500).json({ message: '게시글 정보를 가져오지 못했습니다.' });
  }
});

// 5. 특정 게시글의 댓글 목록 조회
app.get('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        c.*, 
        u.nickname as author_nickname
      FROM solkka.comment c
      LEFT JOIN solkka.user_account u ON c.user_account_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Comments Error:', error);
    res.status(500).json({ message: '댓글 목록을 가져오지 못했습니다.' });
  }
});

// 6. 댓글 작성
app.post('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { user_account_id, content, parent_comment_id } = req.body;

  if (!content) {
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO solkka.comment 
       (post_id, user_account_id, content, parent_comment_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [id, user_account_id || null, content, parent_comment_id || null]
    );

    res.json({ success: true, message: '댓글이 등록되었습니다.', commentId: result.rows[0].id });
  } catch (error) {
    console.error('Create Comment Error:', error);
    res.status(500).json({ success: false, message: '댓글 등록 중 오류가 발생했습니다.' });
  }
});

// 서버 구동
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Solkka Backend is running on http://localhost:${PORT}`);
});
