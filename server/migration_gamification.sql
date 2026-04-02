-- 1) 사용자 테이블에 요약 수치(포인트, 온도) 컬럼 추가
ALTER TABLE solkka.user_account 
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS temperature NUMERIC(4, 1) DEFAULT 36.5;

-- 2) 이력 추적을 위한 gamification_log 테이블 생성
CREATE TABLE IF NOT EXISTS solkka.gamification_log (
    id SERIAL PRIMARY KEY,
    user_account_id INT REFERENCES solkka.user_account(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    points_earned INT NOT NULL,
    temperature_change NUMERIC(3, 1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gamification_user ON solkka.gamification_log(user_account_id);
