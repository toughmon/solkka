CREATE UNIQUE INDEX IF NOT EXISTS idx_gamification_daily_checkin_unique
ON solkka.gamification_log(user_account_id, action_type, ((created_at)::date))
WHERE action_type = 'DAILY_CHECKIN';
