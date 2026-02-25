SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT column_name FROM information_schema.columns WHERE table_name = 'deliberation_juries' ORDER BY ordinal_position;
SELECT column_name FROM information_schema.columns WHERE table_name = 'deliberation_criteria' ORDER BY ordinal_position;
SELECT column_name FROM information_schema.columns WHERE table_name = 'deliberation_configs' ORDER BY ordinal_position;
