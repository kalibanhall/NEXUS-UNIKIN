-- ============================================================
-- MIGRATION: Activation enseignants par matricule + date de naissance
-- Date: 2026-02-25
-- ============================================================

BEGIN;

-- 1. Ajouter birth_date aux teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. Ajouter matricule_esu aux teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS matricule_esu VARCHAR(50);

-- 3. Mettre à jour les emails des enseignants vers matricule@unikin.ac.cd
-- Pour chaque enseignant de la fac pharma, email = matricule@unikin.ac.cd
UPDATE users u SET 
  email = LOWER(REPLACE(t.matricule, ' ', '')) || '@unikin.ac.cd',
  account_activated = FALSE,
  must_change_password = TRUE,
  updated_at = NOW()
FROM teachers t
WHERE t.user_id = u.id 
  AND u.role = 'TEACHER'
  AND t.matricule IS NOT NULL
  AND t.matricule != ''
  AND t.matricule NOT LIKE 'FSPHAR_%';

-- Pour les enseignants avec matricule placeholder (FSPHAR_xxx), on garde leur email
-- mais on désactive le compte pour activation
UPDATE users u SET 
  account_activated = FALSE,
  must_change_password = TRUE,
  updated_at = NOW()
FROM teachers t
WHERE t.user_id = u.id 
  AND u.role = 'TEACHER'
  AND t.matricule LIKE 'FSPHAR_%';

-- 4. Vérification
SELECT 'ENSEIGNANTS EMAILS MIS A JOUR' AS info, COUNT(*) AS total 
FROM users u 
JOIN teachers t ON t.user_id = u.id 
WHERE u.email LIKE '%@unikin.ac.cd';

SELECT u.email, t.matricule, u.last_name, u.account_activated 
FROM users u 
JOIN teachers t ON t.user_id = u.id 
JOIN departments d ON t.department_id = d.id 
WHERE d.faculty_id = 8 
ORDER BY u.last_name 
LIMIT 10;

COMMIT;
