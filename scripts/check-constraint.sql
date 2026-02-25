SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname LIKE '%course_type%';
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'courses'::regclass AND contype = 'c';
