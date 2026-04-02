const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'solkka-secret-key-2024';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'solkka-refresh-secret-2024';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: '인증 토큰이 필요합니다.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '만료되거나 유효하지 않은 토큰입니다.' });
    req.user = user;
    next();
  });
};

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

    // 4. 랜덤 아바타 생성 (DiceBear API)
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomNickname}`;

    // 5. user_account 테이블에 영구 저장
    const signupResult = await pool.query(
      'INSERT INTO solkka.user_account (email, password_hash, nickname, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, randomNickname, avatarUrl]
    );

    // 6. 사용된 인증 코드 파기
    await pool.query('DELETE FROM solkka.email_verification WHERE email = $1', [email]);

    // 7. JWT 토큰 발급 (Access & Refresh)
    const accessToken = jwt.sign({ id: signupResult.rows[0].id, email }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: signupResult.rows[0].id, email }, REFRESH_SECRET, { expiresIn: '7d' });

    // 8. Refresh Token DB 저장
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      'INSERT INTO solkka.refresh_token (user_account_id, token, expires_at) VALUES ($1, $2, $3)',
      [signupResult.rows[0].id, refreshToken, expiresAt]
    );

    res.json({
      success: true,
      message: '회원가입이 성공적으로 완료되었습니다!',
      accessToken,
      refreshToken,
      user: {
        id: signupResult.rows[0].id,
        email: email,
        nickname: randomNickname,
        avatar_url: avatarUrl
      }
    });

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
      'SELECT id, email, password_hash, nickname, avatar_url FROM solkka.user_account WHERE email = $1',
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

    // 4. JWT 토큰 발급 (Access & Refresh)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Refresh Token DB 저장
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      'INSERT INTO solkka.refresh_token (user_account_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      success: true,
      message: '로그인 성공',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar_url: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: '로그인 처리 중 서버 오류가 발생했습니다.' });
  }
});

// 4. 토큰 갱신 API (Refresh Token)
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: '리프레시 토큰이 필요합니다.' });
  }

  try {
    // DB에서 토큰 확인
    const result = await pool.query(
      'SELECT user_account_id FROM solkka.refresh_token WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: '유효하지 않거나 만료된 세션입니다. 다시 로그인해 주세요.' });
    }

    const userId = result.rows[0].user_account_id;

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: '인증 정보가 비정상적입니다.' });
      }

      // 새로운 Access Token 발급
      const accessToken = jwt.sign(
        { id: userId, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        success: true,
        accessToken
      });
    });
  } catch (err) {
    console.error('Refresh Error:', err);
    res.status(500).json({ message: '토큰 갱신 중 오류가 발생했습니다.' });
  }
});

// 5. 로그아웃 API (Refresh Token 삭제)
app.post('/api/auth/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.json({ success: true });

  try {
    await pool.query('DELETE FROM solkka.refresh_token WHERE token = $1', [refreshToken]);
    res.json({ success: true, message: '로그아웃 되었습니다.' });
  } catch (err) {
    console.error('Logout Error:', err);
    res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
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
app.post('/api/posts', authenticateToken, async (req, res) => {
  const { category_id, title, content, is_counseling_requested } = req.body;
  const user_account_id = req.user.id;

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
  const { user_id, category_id } = req.query;
  try {
    let query = `
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.view_count, 
        p.like_count, 
        p.is_counseling_requested,
        p.created_at,
        c.name as category_name,
        u.avatar_url as author_avatar_url,
        EXISTS(SELECT 1 FROM solkka.post_like WHERE post_id = p.id AND user_account_id = $1) as is_liked
      FROM solkka.post p
      JOIN solkka.category c ON p.category_id = c.id
      LEFT JOIN solkka.user_account u ON p.user_account_id = u.id
    `;
    const params = [user_id || null];
    let paramIndex = 2;

    if (category_id && category_id !== 'all') {
      query += ` WHERE p.category_id = $${paramIndex}`;
      params.push(category_id);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    res.status(500).json({ message: '게시글 목록을 가져오지 못했습니다.' });
  }
});

// 4. 단일 게시글 상세 조회
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        c.name as category_name,
        u.nickname as author_nickname,
        u.avatar_url as author_avatar_url,
        EXISTS(SELECT 1 FROM solkka.post_like WHERE post_id = p.id AND user_account_id = $2) as is_liked
      FROM solkka.post p
      JOIN solkka.category c ON p.category_id = c.id
      LEFT JOIN solkka.user_account u ON p.user_account_id = u.id
      WHERE p.id = $1
    `, [id, user_id || null]);

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
  const { user_id } = req.query;
  try {
    const result = await pool.query(`
      SELECT 
        c.*, 
        u.nickname as author_nickname,
        u.avatar_url as author_avatar_url,
        EXISTS(SELECT 1 FROM solkka.comment_like WHERE comment_id = c.id AND user_account_id = $2) as is_liked
      FROM solkka.comment c
      LEFT JOIN solkka.user_account u ON c.user_account_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [id, user_id || null]);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Comments Error:', error);
    res.status(500).json({ message: '댓글 목록을 가져오지 못했습니다.' });
  }
});

// 6. 댓글 작성
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content, parent_comment_id } = req.body;
  const user_account_id = req.user.id;

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

// 7. 사용자 아바타 랜덤 변경
app.patch('/api/users/:id/avatar', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { avatar_url } = req.body;

  // 본인 확인
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ message: '본인의 아바타만 변경할 수 있습니다.' });
  }

  if (!avatar_url) {
    return res.status(400).json({ message: '아바타 URL이 필요합니다.' });
  }

  try {
    const result = await pool.query(
      'UPDATE solkka.user_account SET avatar_url = $1 WHERE id = $2 RETURNING id',
      [avatar_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '아바타가 성공적으로 변경되었습니다.', avatar_url });
  } catch (error) {
    console.error('Update Avatar Error:', error);
    res.status(500).json({ success: false, message: '아바타 변경 중 오류가 발생했습니다.' });
  }
});

// 7-5. 내 활동 통계 (작성한 글, 남긴 댓글, 진행중인 채팅 수)
app.get('/api/users/me/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const postCountResult = await pool.query(
      'SELECT COUNT(*) FROM solkka.post WHERE user_account_id = $1',
      [userId]
    );
    const postCount = parseInt(postCountResult.rows[0].count) || 0;

    const commentCountResult = await pool.query(
      'SELECT COUNT(*) FROM solkka.comment WHERE user_account_id = $1 AND is_deleted = FALSE',
      [userId]
    );
    const commentCount = parseInt(commentCountResult.rows[0].count) || 0;

    const chatCountResult = await pool.query(
      'SELECT COUNT(*) FROM solkka.chat_room WHERE (user1_id = $1 OR user2_id = $1) AND is_active = TRUE',
      [userId]
    );
    const chatCount = parseInt(chatCountResult.rows[0].count) || 0;

    res.json({
      postCount,
      commentCount,
      chatCount
    });
  } catch (error) {
    console.error('Fetch Stats Error:', error);
    res.status(500).json({ message: '통계 정보를 가져오지 못했습니다.' });
  }
});

// 7-6. 내 최근 활동 목록 (게시글, 채팅 혼합 최대 3개)
app.get('/api/users/me/activities', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const resultArr = [];

    const postsResult = await pool.query(`
      SELECT p.id, p.title, p.content, p.created_at, p.like_count, 
             c.name as category_name,
             (SELECT COUNT(*) FROM solkka.comment WHERE post_id = p.id AND is_deleted = false) as comment_count
      FROM solkka.post p
      JOIN solkka.category c ON p.category_id = c.id
      WHERE p.user_account_id = $1
      ORDER BY p.created_at DESC
      LIMIT 3
    `, [userId]);

    postsResult.rows.forEach(p => {
      resultArr.push({
        type: 'post',
        id: p.id,
        title: p.title,
        content: p.content,
        created_at: p.created_at,
        categoryName: p.category_name,
        likeCount: p.like_count || 0,
        commentCount: p.comment_count || 0
      });
    });

    const chatsResult = await pool.query(`
      SELECT cr.id, cr.created_at, cr.is_active,
        CASE WHEN cr.user1_id = $1 THEN u2.nickname ELSE u1.nickname END as partner_nickname,
        CASE WHEN cr.user1_id = $1 THEN u2.avatar_url ELSE u1.avatar_url END as partner_avatar_url,
        lm.content as last_message,
        lm.created_at as last_message_at
      FROM solkka.chat_room cr
      JOIN solkka.user_account u1 ON cr.user1_id = u1.id
      JOIN solkka.user_account u2 ON cr.user2_id = u2.id
      LEFT JOIN LATERAL (
        SELECT content, created_at FROM solkka.chat_message 
        WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1
      ) lm ON TRUE
      WHERE (cr.user1_id = $1 OR cr.user2_id = $1) AND cr.is_active = TRUE
      ORDER BY COALESCE(lm.created_at, cr.created_at) DESC
      LIMIT 3
    `, [userId]);

    chatsResult.rows.forEach(c => {
      resultArr.push({
        type: 'chat',
        id: c.id,
        partnerNickname: c.partner_nickname,
        partnerAvatarUrl: c.partner_avatar_url,
        lastMessage: c.last_message,
        created_at: c.last_message_at || c.created_at,
      });
    });

    resultArr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(resultArr.slice(0, 3));

  } catch (error) {
    console.error('Fetch Activities Error:', error);
    res.status(500).json({ message: '최근 활동 정보를 가져오지 못했습니다.' });
  }
});

// 8. 게시글 좋아요 토글
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_account_id = req.user.id;

  if (!user_account_id) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 이미 좋아요를 눌렀는지 확인
    const check = await client.query(
      'SELECT 1 FROM solkka.post_like WHERE user_account_id = $1 AND post_id = $2',
      [user_account_id, id]
    );

    if (check.rows.length > 0) {
      // 이미 있으면 삭제 (취소)
      await client.query(
        'DELETE FROM solkka.post_like WHERE user_account_id = $1 AND post_id = $2',
        [user_account_id, id]
      );
      await client.query(
        'UPDATE solkka.post SET like_count = like_count - 1 WHERE id = $1',
        [id]
      );
      await client.query('COMMIT');
      res.json({ success: true, liked: false });
    } else {
      // 없으면 추가
      await client.query(
        'INSERT INTO solkka.post_like (user_account_id, post_id) VALUES ($1, $2)',
        [user_account_id, id]
      );
      await client.query(
        'UPDATE solkka.post SET like_count = like_count + 1 WHERE id = $1',
        [id]
      );
      await client.query('COMMIT');
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Post Like Toggle Error:', error);
    res.status(500).json({ message: '좋아요 처리에 실패했습니다.' });
  } finally {
    client.release();
  }
});

// 9. 댓글 좋아요 토글
app.post('/api/comments/:id/like', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_account_id = req.user.id;

  if (!user_account_id) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const check = await client.query(
      'SELECT 1 FROM solkka.comment_like WHERE user_account_id = $1 AND comment_id = $2',
      [user_account_id, id]
    );

    if (check.rows.length > 0) {
      await client.query(
        'DELETE FROM solkka.comment_like WHERE user_account_id = $1 AND comment_id = $2',
        [user_account_id, id]
      );
      await client.query(
        'UPDATE solkka.comment SET like_count = like_count - 1 WHERE id = $1',
        [id]
      );
      await client.query('COMMIT');
      res.json({ success: true, liked: false });
    } else {
      await client.query(
        'INSERT INTO solkka.comment_like (user_account_id, comment_id) VALUES ($1, $2)',
        [user_account_id, id]
      );
      await client.query(
        'UPDATE solkka.comment SET like_count = like_count + 1 WHERE id = $1',
        [id]
      );
      await client.query('COMMIT');
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Comment Like Toggle Error:', error);
    res.status(500).json({ message: '좋아요 처리에 실패했습니다.' });
  } finally {
    client.release();
  }
});

// 10. 댓글 삭제 (소프트 딜리트)
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_account_id = req.user.id;

  if (!user_account_id) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const result = await pool.query(
      'UPDATE solkka.comment SET is_deleted = TRUE WHERE id = $1 AND user_account_id = $2 RETURNING id',
      [id, user_account_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: '본인의 댓글만 삭제할 수 있습니다.' });
    }

    res.json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
  }
});

/* ================================
   상담 요청(Counseling Request) API
================================ */

// 11. 상담 요청 생성
app.post('/api/counseling-requests', authenticateToken, async (req, res) => {
  const { post_id, responder_id, comment_id } = req.body;
  const requester_id = req.user.id;

  if (!post_id || !responder_id) {
    return res.status(400).json({ message: '게시글 ID와 응답자 ID가 필요합니다.' });
  }

  if (requester_id === responder_id) {
    return res.status(400).json({ message: '자기 자신에게는 상담 요청을 보낼 수 없습니다.' });
  }

  try {
    // 중복 요청 확인 (pending 또는 accepted 상태)
    const existing = await pool.query(
      `SELECT id FROM solkka.counseling_request 
       WHERE post_id = $1 AND requester_id = $2 AND responder_id = $3 
       AND status IN ('pending', 'accepted')`,
      [post_id, requester_id, responder_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: '이미 진행 중인 상담 요청이 있습니다.' });
    }

    const result = await pool.query(
      `INSERT INTO solkka.counseling_request (post_id, requester_id, responder_id, comment_id) 
       VALUES ($1, $2, $3, $4) RETURNING id, status`,
      [post_id, requester_id, responder_id, comment_id || null]
    );

    // Socket.IO로 실시간 알림
    io.to(`user_${responder_id}`).emit('new_request', {
      requestId: result.rows[0].id,
      requesterId: requester_id
    });

    res.json({ success: true, message: '상담 요청이 전송되었습니다.', request: result.rows[0] });
  } catch (error) {
    console.error('Create Counseling Request Error:', error);
    res.status(500).json({ message: '상담 요청 중 오류가 발생했습니다.' });
  }
});

// 12. 내가 받은 상담 요청 목록
app.get('/api/counseling-requests/received', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cr.*, 
        u.nickname as requester_nickname, u.avatar_url as requester_avatar_url,
        p.title as post_title
      FROM solkka.counseling_request cr
      JOIN solkka.user_account u ON cr.requester_id = u.id
      JOIN solkka.post p ON cr.post_id = p.id
      WHERE cr.responder_id = $1
      ORDER BY cr.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Received Requests Error:', error);
    res.status(500).json({ message: '요청 목록을 가져오지 못했습니다.' });
  }
});

// 13. 내가 보낸 상담 요청 목록
app.get('/api/counseling-requests/sent', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cr.*, 
        u.nickname as responder_nickname, u.avatar_url as responder_avatar_url,
        p.title as post_title
      FROM solkka.counseling_request cr
      JOIN solkka.user_account u ON cr.responder_id = u.id
      JOIN solkka.post p ON cr.post_id = p.id
      WHERE cr.requester_id = $1
      ORDER BY cr.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Sent Requests Error:', error);
    res.status(500).json({ message: '요청 목록을 가져오지 못했습니다.' });
  }
});

// 14. 상담 요청 수락 → 채팅방 자동 생성
app.patch('/api/counseling-requests/:id/accept', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 요청 확인 및 권한 체크
    const reqResult = await client.query(
      'SELECT * FROM solkka.counseling_request WHERE id = $1 AND responder_id = $2 AND status = $3',
      [id, req.user.id, 'pending']
    );

    if (reqResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: '유효한 상담 요청을 찾을 수 없습니다.' });
    }

    const request = reqResult.rows[0];

    // 상태 업데이트
    await client.query(
      'UPDATE solkka.counseling_request SET status = $1 WHERE id = $2',
      ['accepted', id]
    );

    // 채팅방 생성
    const roomResult = await client.query(
      `INSERT INTO solkka.chat_room (counseling_request_id, user1_id, user2_id) 
       VALUES ($1, $2, $3) RETURNING id`,
      [id, request.requester_id, request.responder_id]
    );

    await client.query('COMMIT');

    const roomId = roomResult.rows[0].id;

    // 요청자에게 실시간 알림
    io.to(`user_${request.requester_id}`).emit('request_accepted', {
      requestId: parseInt(id),
      roomId
    });

    res.json({ success: true, message: '상담 요청을 수락했습니다.', roomId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Accept Counseling Request Error:', error);
    res.status(500).json({ message: '요청 수락 중 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
});

// 15. 상담 요청 거절
app.patch('/api/counseling-requests/:id/reject', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE solkka.counseling_request SET status = 'rejected' 
       WHERE id = $1 AND responder_id = $2 AND status = 'pending' RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '유효한 상담 요청을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '상담 요청을 거절했습니다.' });
  } catch (error) {
    console.error('Reject Counseling Request Error:', error);
    res.status(500).json({ message: '요청 거절 중 오류가 발생했습니다.' });
  }
});

/* ================================
   채팅(Chat) API
================================ */

// 16. 내 채팅방 목록 조회 (최근 메시지 포함)
app.get('/api/chat-rooms', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cr.id,
        cr.is_active,
        cr.created_at,
        CASE WHEN cr.user1_id = $1 THEN u2.id ELSE u1.id END as partner_id,
        CASE WHEN cr.user1_id = $1 THEN u2.nickname ELSE u1.nickname END as partner_nickname,
        CASE WHEN cr.user1_id = $1 THEN u2.avatar_url ELSE u1.avatar_url END as partner_avatar_url,
        lm.content as last_message,
        lm.created_at as last_message_at,
        (SELECT COUNT(*) FROM solkka.chat_message WHERE chat_room_id = cr.id AND sender_id != $1 AND is_read = FALSE)::int as unread_count,
        p.content as post_content
      FROM solkka.chat_room cr
      JOIN solkka.user_account u1 ON cr.user1_id = u1.id
      JOIN solkka.user_account u2 ON cr.user2_id = u2.id
      LEFT JOIN solkka.counseling_request creq ON cr.counseling_request_id = creq.id
      LEFT JOIN solkka.post p ON creq.post_id = p.id
      LEFT JOIN LATERAL (
        SELECT content, created_at FROM solkka.chat_message 
        WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1
      ) lm ON TRUE
      WHERE (cr.user1_id = $1 OR cr.user2_id = $1) AND cr.is_active = TRUE
      ORDER BY COALESCE(lm.created_at, cr.created_at) DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Chat Rooms Error:', error);
    res.status(500).json({ message: '채팅방 목록을 가져오지 못했습니다.' });
  }
});

// 17. 특정 채팅방 메시지 조회 (페이지네이션)
app.get('/api/chat-rooms/:id/messages', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { cursor, limit = 30 } = req.query;

  try {
    // 채팅방 참여자 확인
    const roomCheck = await pool.query(
      'SELECT id FROM solkka.chat_room WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [id, req.user.id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({ message: '채팅방에 접근할 수 없습니다.' });
    }

    let query, params;
    if (cursor) {
      query = `
        SELECT cm.*, u.nickname as sender_nickname, u.avatar_url as sender_avatar_url
        FROM solkka.chat_message cm
        LEFT JOIN solkka.user_account u ON cm.sender_id = u.id
        WHERE cm.chat_room_id = $1 AND cm.created_at < $2
        ORDER BY cm.created_at DESC LIMIT $3
      `;
      params = [id, cursor, parseInt(limit)];
    } else {
      query = `
        SELECT cm.*, u.nickname as sender_nickname, u.avatar_url as sender_avatar_url
        FROM solkka.chat_message cm
        LEFT JOIN solkka.user_account u ON cm.sender_id = u.id
        WHERE cm.chat_room_id = $1
        ORDER BY cm.created_at DESC LIMIT $2
      `;
      params = [id, parseInt(limit)];
    }

    const result = await pool.query(query, params);

    // 읽음 처리 (상대방의 메시지를 모두 읽음 표시)
    await pool.query(
      `UPDATE solkka.chat_message SET is_read = TRUE 
       WHERE chat_room_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [id, req.user.id]
    );

    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    res.status(500).json({ message: '메시지를 가져오지 못했습니다.' });
  }
});

// 17-5. 읽지 않은 총 메시지 수 조회
app.get('/api/chat-rooms/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as unread_count
       FROM solkka.chat_message cm
       JOIN solkka.chat_room cr ON cm.chat_room_id = cr.id
       WHERE (cr.user1_id = $1 OR cr.user2_id = $1)
         AND cm.sender_id != $1
         AND cm.is_read = FALSE`,
      [req.user.id]
    );
    res.json({ unreadCount: parseInt(result.rows[0].unread_count) || 0 });
  } catch (error) {
    console.error('Fetch Unread Count Error:', error);
    res.status(500).json({ message: '읽지 않은 메시지 수를 가져오지 못했습니다.' });
  }
});

// 18. 메시지 전송 (REST API)
app.post('/api/chat-rooms/:id/messages', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: '메시지 내용을 입력해주세요.' });
  }

  try {
    // 채팅방 참여자 확인
    const roomCheck = await pool.query(
      'SELECT user1_id, user2_id FROM solkka.chat_room WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [id, req.user.id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({ message: '채팅방에 접근할 수 없습니다.' });
    }

    const room = roomCheck.rows[0];
    const partnerId = room.user1_id === req.user.id ? room.user2_id : room.user1_id;

    // 메시지 DB 저장
    const result = await pool.query(
      `INSERT INTO solkka.chat_message (chat_room_id, sender_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, chat_room_id, sender_id, content, is_read, created_at`,
      [id, req.user.id, content.trim()]
    );

    // 발신자 닉네임 조회
    const userResult = await pool.query(
      'SELECT nickname, avatar_url FROM solkka.user_account WHERE id = $1',
      [req.user.id]
    );

    const message = {
      ...result.rows[0],
      sender_nickname: userResult.rows[0]?.nickname,
      sender_avatar_url: userResult.rows[0]?.avatar_url
    };

    // Socket.IO로 실시간 브로드캐스트
    io.to(`room_${id}`).emit('new_message', message);
    io.to(`user_${partnerId}`).emit('chat_notification', {
      roomId: parseInt(id),
      message
    });

    res.json({ success: true, message: message });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: '메시지 전송에 실패했습니다.' });
  }
});

/* ================================
   Socket.IO 실시간 통신
================================ */

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Socket.IO 인증 미들웨어
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.error(`Socket Auth Error: No token provided for socket ${socket.id}`);
    return next(new Error('인증 토큰이 필요합니다.'));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error(`Socket Auth Error: Invalid token for socket ${socket.id}`, err.message);
      return next(new Error('유효하지 않은 토큰입니다.'));
    }
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: user ${socket.user.id}`);

  // 개인 알림 채널 자동 참가
  socket.join(`user_${socket.user.id}`);

  // 채팅방 입장
  socket.on('join_room', async (roomId) => {
    try {
      const check = await pool.query(
        'SELECT id FROM solkka.chat_room WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
        [roomId, socket.user.id]
      );
      if (check.rows.length > 0) {
        socket.join(`room_${roomId}`);
        console.log(`User ${socket.user.id} joined room_${roomId}`);
      }
    } catch (err) {
      console.error('Join Room Error:', err);
    }
  });

  // 채팅방 퇴장
  socket.on('leave_room', (roomId) => {
    socket.leave(`room_${roomId}`);
  });

  // 메시지 전송
  socket.on('send_message', async ({ roomId, content }) => {
    console.log(`📨 send_message received from user ${socket.user.id}: roomId=${roomId}, content="${content?.substring(0, 20)}"`);
    if (!content || !content.trim()) return;

    try {
      // 채팅방 참여자 확인
      const roomCheck = await pool.query(
        'SELECT user1_id, user2_id FROM solkka.chat_room WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
        [roomId, socket.user.id]
      );

      console.log(`📨 roomCheck result: ${roomCheck.rows.length} rows, user=${socket.user.id}, roomId=${roomId}`);
      if (roomCheck.rows.length === 0) {
        console.log(`❌ Room check failed for user ${socket.user.id} in room ${roomId}`);
        return;
      }

      const room = roomCheck.rows[0];
      const partnerId = room.user1_id === socket.user.id ? room.user2_id : room.user1_id;

      // 메시지 DB 저장
      const result = await pool.query(
        `INSERT INTO solkka.chat_message (chat_room_id, sender_id, content) 
         VALUES ($1, $2, $3) 
         RETURNING id, chat_room_id, sender_id, content, is_read, created_at`,
        [roomId, socket.user.id, content.trim()]
      );

      // 발신자 닉네임 조회
      const userResult = await pool.query(
        'SELECT nickname, avatar_url FROM solkka.user_account WHERE id = $1',
        [socket.user.id]
      );

      const message = {
        ...result.rows[0],
        sender_nickname: userResult.rows[0]?.nickname,
        sender_avatar_url: userResult.rows[0]?.avatar_url
      };

      // 채팅방 내 모든 참가자에게 전송
      io.to(`room_${roomId}`).emit('new_message', message);

      // 상대방이 채팅방에 없는 경우 개인 채널로도 알림
      io.to(`user_${partnerId}`).emit('chat_notification', {
        roomId: parseInt(roomId),
        message
      });
    } catch (err) {
      console.error('Send Message Error:', err);
    }
  });

  // 메시지 읽음 처리
  socket.on('message_read', async (roomId) => {
    try {
      await pool.query(
        `UPDATE solkka.chat_message SET is_read = TRUE 
         WHERE chat_room_id = $1 AND sender_id != $2 AND is_read = FALSE`,
        [roomId, socket.user.id]
      );
      socket.to(`room_${roomId}`).emit('messages_read', { roomId, readBy: socket.user.id });
    } catch (err) {
      console.error('Message Read Error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: user ${socket.user.id}`);
  });
});

// 서버 구동
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Solkka Backend is running on http://localhost:${PORT}`);
});
