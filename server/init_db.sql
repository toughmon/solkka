CREATE SCHEMA IF NOT EXISTS solkka; SET search_path TO solkka; CREATE TABLE IF NOT EXISTS user_account ( id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, nickname VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); CREATE TABLE IF NOT EXISTS email_verification ( id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL, code VARCHAR(6) NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); CREATE INDEX IF NOT EXISTS idx_user_account_email ON user_account(email); CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification(email);

-- 3. 카테고리 테이블 추가
CREATE TABLE IF NOT EXISTS category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO category (name, description) VALUES 
('연애', '사랑, 썸, 연애 중 발생하는 다양한 고민'),
('이별', '이별의 아픔, 미련, 재회에 관한 이야기'),
('짝사랑', '홀로 키워온 마음, 고백에 대한 고민'),
('결혼', '배우자, 시댁/처가, 결혼 준비 및 생활'),
('가족', '부모, 형제, 가족 간의 갈등과 사랑'),
('친구', '우정, 절친과의 갈등, 새로운 관계 형성'),
('직장', '업무 스트레스, 상사/동료 관계, 퇴사 고민'),
('진로', '학업, 취업, 이직 등 미래에 대한 준비'),
('경제', '재테크, 부동산, 자산 관리 및 경제적 불안'),
('심리', '우울, 불안, 자존감 등 내면의 목소리'),
('자랑', '나만의 성취, 기쁜 소식, 소소한 행복 공유'),
('일상', '분류하기 어려운 소소한 일상 이야기')
ON CONFLICT (name) DO NOTHING;
