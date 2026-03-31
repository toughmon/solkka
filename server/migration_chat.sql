SET search_path TO solkka;

-- 1. 상담 요청 테이블
CREATE TABLE IF NOT EXISTS counseling_request (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES post(id) ON DELETE CASCADE,
  requester_id INT REFERENCES user_account(id) ON DELETE CASCADE,
  responder_id INT REFERENCES user_account(id) ON DELETE CASCADE,
  comment_id INT REFERENCES comment(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counseling_request_requester ON counseling_request(requester_id);
CREATE INDEX IF NOT EXISTS idx_counseling_request_responder ON counseling_request(responder_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_counseling_request_unique 
  ON counseling_request(post_id, requester_id, responder_id) 
  WHERE status IN ('pending', 'accepted');

-- 2. 채팅방 테이블
CREATE TABLE IF NOT EXISTS chat_room (
  id SERIAL PRIMARY KEY,
  counseling_request_id INT REFERENCES counseling_request(id) ON DELETE SET NULL,
  user1_id INT REFERENCES user_account(id) ON DELETE CASCADE,
  user2_id INT REFERENCES user_account(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_room_user1 ON chat_room(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_user2 ON chat_room(user2_id);

-- 3. 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_message (
  id SERIAL PRIMARY KEY,
  chat_room_id INT REFERENCES chat_room(id) ON DELETE CASCADE,
  sender_id INT REFERENCES user_account(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_message_room ON chat_message(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_created ON chat_message(chat_room_id, created_at DESC);
