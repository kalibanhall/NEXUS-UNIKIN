-- ============================================
-- NEXUS UNIKIN - Données de test pour nouvelles fonctionnalités
-- ============================================

-- Types de frais
INSERT INTO fee_types (code, name, description, default_amount, category, is_mandatory) VALUES
('FRAIS_ACAD', 'Frais Académiques', 'Frais académiques annuels', 800.00, 'ACADEMIQUE', TRUE),
('FRAIS_MINERVAL', 'Minerval', 'Frais de minerval', 150.00, 'ACADEMIQUE', TRUE),
('FRAIS_LABO', 'Frais de Laboratoire', 'Accès aux laboratoires et équipements', 100.00, 'LABORATOIRE', FALSE),
('FRAIS_ENROLL_S1', 'Frais d''Enrollment Semestre 1', 'Frais d''enrollment pour le premier semestre', 75.00, 'ENROLLMENT', TRUE),
('FRAIS_ENROLL_S2', 'Frais d''Enrollment Semestre 2', 'Frais d''enrollment pour le second semestre', 75.00, 'ENROLLMENT', TRUE),
('FRAIS_EXAM', 'Frais d''Examen', 'Frais pour les sessions d''examen', 50.00, 'AUTRE', TRUE),
('FRAIS_BIBLIO', 'Carte Bibliothèque', 'Accès à la bibliothèque universitaire', 25.00, 'AUTRE', FALSE),
('FRAIS_SPORT', 'Carte Sport', 'Accès aux installations sportives', 25.00, 'AUTRE', FALSE)
ON CONFLICT (code) DO NOTHING;

-- Frais pour les étudiants existants (année 2025-2026)
INSERT INTO student_fees (student_id, fee_type_id, academic_year_id, semester, amount_due, amount_paid, status, due_date)
SELECT 
    s.id,
    ft.id,
    ay.id,
    CASE WHEN ft.code LIKE '%S1%' THEN 1 WHEN ft.code LIKE '%S2%' THEN 2 ELSE NULL END,
    ft.default_amount,
    CASE 
        WHEN s.payment_status = 'PAID' THEN ft.default_amount
        WHEN s.payment_status = 'PARTIAL' THEN ft.default_amount * 0.5
        ELSE 0
    END,
    CASE 
        WHEN s.payment_status = 'PAID' THEN 'PAID'
        WHEN s.payment_status = 'PARTIAL' THEN 'PARTIAL'
        ELSE 'PENDING'
    END,
    '2026-01-31'
FROM students s
CROSS JOIN fee_types ft
CROSS JOIN academic_years ay
WHERE ay.is_current = TRUE
AND ft.category IN ('ACADEMIQUE', 'ENROLLMENT')
ON CONFLICT DO NOTHING;

-- Statuts utilisateurs (tous hors ligne par défaut)
INSERT INTO user_status (user_id, is_online, last_seen)
SELECT id, FALSE, NOW() - (random() * interval '7 days')
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Messages de test entre utilisateurs
DO $$
DECLARE
    admin_id INTEGER;
    teacher_id INTEGER;
    student_id INTEGER;
BEGIN
    SELECT id INTO admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    SELECT u.id INTO teacher_id FROM users u JOIN teachers t ON u.id = t.user_id LIMIT 1;
    SELECT u.id INTO student_id FROM users u JOIN students s ON u.id = s.user_id LIMIT 1;

    IF admin_id IS NOT NULL AND student_id IS NOT NULL THEN
        INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES
        (admin_id, student_id, 'Bienvenue à l''Université de Kinshasa ! Votre inscription a été validée.', TRUE),
        (admin_id, student_id, 'N''oubliez pas de compléter vos paiements avant la fin du mois.', TRUE),
        (student_id, admin_id, 'Merci pour l''information. Quand puis-je retirer ma carte d''étudiant ?', TRUE),
        (admin_id, student_id, 'Vous pouvez passer au secrétariat à partir de lundi prochain.', FALSE);
    END IF;

    IF teacher_id IS NOT NULL AND student_id IS NOT NULL THEN
        INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES
        (teacher_id, student_id, 'Bonjour, n''oubliez pas le TP de demain à 10h.', TRUE),
        (student_id, teacher_id, 'Bonjour Professeur, j''ai une question sur le cours d''algorithmique.', TRUE),
        (teacher_id, student_id, 'Je suis disponible jeudi après-midi pour une consultation.', FALSE);
    END IF;
END $$;

-- Demandes de documents de test
INSERT INTO document_requests (student_id, document_type, status, requested_at, copies, fee_amount, fee_paid)
SELECT 
    s.id,
    'ATTESTATION_INSCRIPTION',
    'APPROVED',
    NOW() - interval '5 days',
    1,
    5.00,
    TRUE
FROM students s LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO document_requests (student_id, document_type, status, requested_at, copies)
SELECT 
    s.id,
    'RELEVE_NOTES',
    'PENDING',
    NOW() - interval '2 days',
    2
FROM students s OFFSET 3 LIMIT 2
ON CONFLICT DO NOTHING;

-- Bordereaux de paiement de test
INSERT INTO payment_receipts (student_id, receipt_type, receipt_number, bank_name, bank_reference, amount, payment_date, verified)
SELECT 
    p.student_id,
    'BORDEREAU',
    'BRD-' || p.receipt_number,
    'RawBank',
    'REF-' || LPAD(p.id::text, 8, '0'),
    p.amount,
    p.payment_date::date,
    TRUE
FROM payments p
WHERE p.status = 'COMPLETED'
ON CONFLICT DO NOTHING;

-- Résultats de délibération pour les étudiants
INSERT INTO deliberation_results (student_id, semester, academic_year_id, total_credits, validated_credits, average_score, decision, mention, is_fees_complete, can_view)
SELECT 
    s.id,
    1,
    ay.id,
    60,
    CASE WHEN s.payment_status = 'PAID' THEN 54 ELSE 48 END,
    CASE 
        WHEN s.payment_status = 'PAID' THEN 14.5 + (random() * 3)
        ELSE 11 + (random() * 4)
    END,
    CASE 
        WHEN s.payment_status = 'PAID' THEN 'ADMIS'
        WHEN s.payment_status = 'PARTIAL' THEN 'EN_ATTENTE'
        ELSE 'EN_ATTENTE'
    END,
    CASE 
        WHEN s.payment_status = 'PAID' THEN 'SATISFACTION'
        ELSE NULL
    END,
    s.payment_status = 'PAID',
    s.payment_status = 'PAID'
FROM students s
CROSS JOIN academic_years ay
WHERE ay.is_current = TRUE
ON CONFLICT DO NOTHING;

-- Plus de cours dans l'emploi du temps
INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room, schedule_type)
SELECT 
    c.id,
    (row_number() OVER () % 5)::int,
    CASE (row_number() OVER () % 4)
        WHEN 0 THEN '08:00'
        WHEN 1 THEN '10:00'
        WHEN 2 THEN '14:00'
        ELSE '16:00'
    END::time,
    CASE (row_number() OVER () % 4)
        WHEN 0 THEN '10:00'
        WHEN 1 THEN '12:00'
        WHEN 2 THEN '16:00'
        ELSE '18:00'
    END::time,
    'Salle ' || ((row_number() OVER () % 10) + 100),
    CASE (row_number() OVER () % 3)
        WHEN 0 THEN 'CM'
        WHEN 1 THEN 'TD'
        ELSE 'TP'
    END
FROM courses c
WHERE NOT EXISTS (
    SELECT 1 FROM course_schedules cs WHERE cs.course_id = c.id
)
ON CONFLICT DO NOTHING;

-- Notifications supplémentaires
INSERT INTO notifications (user_id, title, message, type, link, is_read)
SELECT 
    u.id,
    'Résultats disponibles',
    'Les résultats de la session de janvier sont maintenant disponibles.',
    'SUCCESS',
    '/student/grades',
    FALSE
FROM users u
JOIN students s ON u.id = s.user_id
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read)
SELECT 
    u.id,
    'Rappel de paiement',
    'N''oubliez pas de régulariser votre situation financière avant le 31 janvier.',
    'WARNING',
    '/student/finances',
    FALSE
FROM users u
JOIN students s ON u.id = s.user_id
WHERE s.payment_status != 'PAID'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read)
SELECT 
    u.id,
    'Nouveau message',
    'Vous avez reçu un nouveau message de l''administration.',
    'INFO',
    '/student/messages',
    FALSE
FROM users u
JOIN students s ON u.id = s.user_id
LIMIT 5
ON CONFLICT DO NOTHING;
