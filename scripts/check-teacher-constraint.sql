SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'teachers'::regclass AND contype = 'c';
