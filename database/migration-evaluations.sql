-- ============================================
-- Migration: Système d'Évaluations NEXUS UNIKIN
-- ============================================
-- Ce script crée les tables nécessaires pour le système
-- d'évaluations complet incluant:
-- - Examens, Quiz
-- - Travaux Pratiques (TP)
-- - Travaux Dirigés (TD)
-- - Projets tutorés
-- - Devoirs (Homework)
-- - Évaluations orales
-- - Système anti-plagiat
-- ============================================

-- Types d'évaluation
CREATE TYPE evaluation_type AS ENUM (
    'EXAM',        -- Examen traditionnel
    'QUIZ',        -- Interrogation
    'TP',          -- Travaux Pratiques
    'TD',          -- Travaux Dirigés
    'PROJECT',     -- Projet tutoré
    'ORAL'         -- Évaluation orale
);

-- Types de questions
CREATE TYPE question_type AS ENUM (
    'MCQ',              -- Question à choix multiple (une seule réponse)
    'TRUE_FALSE',       -- Vrai ou Faux
    'SHORT_ANSWER',     -- Réponse courte
    'ESSAY',            -- Rédaction longue
    'MULTIPLE_SELECT',  -- Choix multiples (plusieurs réponses)
    'FILE_UPLOAD'       -- Téléversement de fichier
);

-- Statuts d'évaluation
CREATE TYPE evaluation_status AS ENUM (
    'DRAFT',      -- Brouillon, non visible aux étudiants
    'ACTIVE',     -- Publié et ouvert aux soumissions
    'COMPLETED',  -- Terminé, plus de soumissions
    'ARCHIVED'    -- Archivé
);

-- Statuts de plagiat
CREATE TYPE plagiarism_status AS ENUM (
    'PENDING',    -- En attente d'analyse
    'CLEAN',      -- Aucun plagiat détecté (< 15%)
    'SUSPICIOUS', -- Plagiat suspecté (15-40%)
    'PLAGIARIZED' -- Plagiat confirmé (> 40%)
);

-- ============================================
-- Table principale des évaluations
-- ============================================
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informations de base
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    evaluation_type evaluation_type NOT NULL DEFAULT 'EXAM',
    
    -- Association au cours
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id),
    academic_year_id UUID REFERENCES academic_years(id),
    
    -- Configuration temporelle
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER, -- Durée en minutes (null = pas de limite)
    
    -- Configuration des points
    total_points DECIMAL(10, 2) DEFAULT 0,
    passing_score DECIMAL(10, 2), -- Score minimum pour réussir
    
    -- Options
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_options BOOLEAN DEFAULT false,
    show_results BOOLEAN DEFAULT true,
    allow_late_submission BOOLEAN DEFAULT false,
    late_penalty_percent DECIMAL(5, 2) DEFAULT 0, -- Pénalité pour soumission tardive
    
    -- Anti-plagiat
    plagiarism_check BOOLEAN DEFAULT false,
    similarity_threshold DECIMAL(5, 2) DEFAULT 30.00, -- Seuil d'alerte (%)
    
    -- Statut
    status evaluation_status DEFAULT 'DRAFT',
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Contraintes
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    CONSTRAINT valid_points CHECK (total_points >= 0),
    CONSTRAINT valid_threshold CHECK (similarity_threshold BETWEEN 0 AND 100)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_evaluations_course ON evaluations(course_id);
CREATE INDEX idx_evaluations_teacher ON evaluations(teacher_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_dates ON evaluations(start_date, end_date);
CREATE INDEX idx_evaluations_type ON evaluations(evaluation_type);

-- ============================================
-- Table des questions d'évaluation
-- ============================================
CREATE TABLE IF NOT EXISTS evaluation_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    
    -- Contenu de la question
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    
    -- Options pour MCQ/MULTIPLE_SELECT (stockées en JSON)
    options JSONB,
    -- Format: [{"id": "a", "text": "Option A", "is_correct": true}, ...]
    
    -- Réponse correcte
    correct_answer JSONB,
    -- Format varie selon le type:
    -- MCQ: "a" (id de l'option)
    -- MULTIPLE_SELECT: ["a", "c"] (ids des options)
    -- TRUE_FALSE: true ou false
    -- SHORT_ANSWER: "réponse attendue" ou ["réponse1", "réponse2"]
    
    -- Points
    points DECIMAL(10, 2) DEFAULT 1,
    partial_credit BOOLEAN DEFAULT false, -- Crédit partiel pour réponses partielles
    
    -- Ordre d'affichage
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Explication (affichée après soumission)
    explanation TEXT,
    
    -- Configuration spécifique FILE_UPLOAD
    file_types_allowed JSONB, -- [".pdf", ".docx", ".py"]
    max_file_size INTEGER, -- En MB
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_evaluation ON evaluation_questions(evaluation_id);
CREATE INDEX idx_questions_type ON evaluation_questions(question_type);
CREATE INDEX idx_questions_order ON evaluation_questions(evaluation_id, order_index);

-- ============================================
-- Table des tentatives d'évaluation
-- ============================================
CREATE TABLE IF NOT EXISTS evaluation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER, -- Temps effectivement passé
    
    -- Score
    score DECIMAL(10, 2),
    max_score DECIMAL(10, 2),
    percentage DECIMAL(5, 2),
    passed BOOLEAN,
    
    -- Anti-plagiat
    plagiarism_score DECIMAL(5, 2), -- Score de similarité (0-100)
    plagiarism_status plagiarism_status DEFAULT 'PENDING',
    plagiarism_checked_at TIMESTAMP WITH TIME ZONE,
    
    -- Soumission tardive
    is_late BOOLEAN DEFAULT false,
    late_penalty_applied DECIMAL(10, 2) DEFAULT 0,
    
    -- Commentaires de l'enseignant
    teacher_feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    
    -- IP et détails de session (pour audit)
    ip_address INET,
    user_agent TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte: un étudiant ne peut avoir qu'une tentative par évaluation
    UNIQUE(evaluation_id, student_id)
);

CREATE INDEX idx_attempts_evaluation ON evaluation_attempts(evaluation_id);
CREATE INDEX idx_attempts_student ON evaluation_attempts(student_id);
CREATE INDEX idx_attempts_status ON evaluation_attempts(plagiarism_status);
CREATE INDEX idx_attempts_submitted ON evaluation_attempts(submitted_at) WHERE submitted_at IS NOT NULL;

-- ============================================
-- Table des réponses aux questions
-- ============================================
CREATE TABLE IF NOT EXISTS evaluation_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES evaluation_questions(id) ON DELETE CASCADE,
    
    -- Réponse de l'étudiant (stockée en JSON)
    student_answer JSONB,
    -- Format selon le type de question:
    -- MCQ: "a"
    -- MULTIPLE_SELECT: ["a", "c"]
    -- TRUE_FALSE: true/false
    -- SHORT_ANSWER/ESSAY: "texte de réponse"
    -- FILE_UPLOAD: {"file_id": "uuid", "file_name": "document.pdf"}
    
    -- Évaluation
    is_correct BOOLEAN,
    points_earned DECIMAL(10, 2) DEFAULT 0,
    auto_graded BOOLEAN DEFAULT false, -- true si noté automatiquement
    
    -- Commentaire spécifique à la réponse
    feedback TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(attempt_id, question_id)
);

CREATE INDEX idx_responses_attempt ON evaluation_responses(attempt_id);
CREATE INDEX idx_responses_question ON evaluation_responses(question_id);

-- ============================================
-- Table des fichiers soumis
-- ============================================
CREATE TABLE IF NOT EXISTS submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES evaluation_questions(id) ON DELETE SET NULL,
    
    -- Informations fichier
    file_name VARCHAR(255) NOT NULL, -- Nom stocké
    original_name VARCHAR(255) NOT NULL, -- Nom original
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL, -- Taille en bytes
    file_type VARCHAR(50) NOT NULL, -- Extension
    mime_type VARCHAR(100),
    
    -- Contenu textuel extrait (pour l'analyse anti-plagiat)
    file_content TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_attempt ON submission_files(attempt_id);
CREATE INDEX idx_files_question ON submission_files(question_id) WHERE question_id IS NOT NULL;

-- ============================================
-- Table des rapports de plagiat
-- ============================================
CREATE TABLE IF NOT EXISTS plagiarism_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
    
    -- Résultats de l'analyse
    overall_score DECIMAL(5, 2) NOT NULL, -- Score de similarité global (0-100)
    status plagiarism_status NOT NULL,
    
    -- Détails (stockés en JSON)
    sources JSONB, -- Sources détectées
    -- Format: [{"source": "...", "similarity": 45, "matched_text": "..."}]
    
    suspicious_sections JSONB, -- Sections suspectes
    -- Format: [{"text": "...", "similarity": 60, "source": "..."}]
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_by VARCHAR(100) DEFAULT 'SYSTEM' -- Service utilisé
);

CREATE INDEX idx_plagiarism_submission ON plagiarism_reports(submission_id);
CREATE INDEX idx_plagiarism_status ON plagiarism_reports(status);
CREATE INDEX idx_plagiarism_score ON plagiarism_reports(overall_score);

-- ============================================
-- Vue: Statistiques des évaluations
-- ============================================
CREATE OR REPLACE VIEW evaluation_statistics AS
SELECT 
    e.id as evaluation_id,
    e.title,
    e.evaluation_type,
    e.course_id,
    e.teacher_id,
    e.status,
    COUNT(DISTINCT ea.id) as total_attempts,
    COUNT(DISTINCT CASE WHEN ea.submitted_at IS NOT NULL THEN ea.id END) as submitted_count,
    COUNT(DISTINCT CASE WHEN ea.graded_at IS NOT NULL THEN ea.id END) as graded_count,
    AVG(ea.percentage) as average_score,
    MIN(ea.percentage) as min_score,
    MAX(ea.percentage) as max_score,
    COUNT(DISTINCT CASE WHEN ea.passed = true THEN ea.id END) as passed_count,
    COUNT(DISTINCT CASE WHEN ea.plagiarism_status = 'PLAGIARIZED' THEN ea.id END) as plagiarized_count,
    COUNT(DISTINCT CASE WHEN ea.plagiarism_status = 'SUSPICIOUS' THEN ea.id END) as suspicious_count
FROM evaluations e
LEFT JOIN evaluation_attempts ea ON e.id = ea.evaluation_id
GROUP BY e.id, e.title, e.evaluation_type, e.course_id, e.teacher_id, e.status;

-- ============================================
-- Vue: Soumissions en attente de correction
-- ============================================
CREATE OR REPLACE VIEW pending_gradings AS
SELECT 
    ea.id as attempt_id,
    ea.evaluation_id,
    e.title as evaluation_title,
    e.evaluation_type,
    s.id as student_id,
    s.matricule,
    u.first_name || ' ' || u.last_name as student_name,
    ea.submitted_at,
    ea.plagiarism_status,
    ea.plagiarism_score
FROM evaluation_attempts ea
JOIN evaluations e ON ea.evaluation_id = e.id
JOIN students s ON ea.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE ea.submitted_at IS NOT NULL 
  AND ea.graded_at IS NULL
ORDER BY ea.submitted_at ASC;

-- ============================================
-- Fonction: Calculer le score d'une tentative
-- ============================================
CREATE OR REPLACE FUNCTION calculate_attempt_score(p_attempt_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_earned DECIMAL(10, 2);
    v_max_score DECIMAL(10, 2);
    v_percentage DECIMAL(5, 2);
    v_passing_score DECIMAL(10, 2);
BEGIN
    -- Calculer les points gagnés
    SELECT COALESCE(SUM(points_earned), 0) INTO v_total_earned
    FROM evaluation_responses
    WHERE attempt_id = p_attempt_id;
    
    -- Obtenir le score maximum et le score de passage
    SELECT e.total_points, e.passing_score 
    INTO v_max_score, v_passing_score
    FROM evaluations e
    JOIN evaluation_attempts ea ON e.id = ea.evaluation_id
    WHERE ea.id = p_attempt_id;
    
    -- Calculer le pourcentage
    IF v_max_score > 0 THEN
        v_percentage := (v_total_earned / v_max_score) * 100;
    ELSE
        v_percentage := 0;
    END IF;
    
    -- Mettre à jour la tentative
    UPDATE evaluation_attempts
    SET 
        score = v_total_earned,
        max_score = v_max_score,
        percentage = v_percentage,
        passed = CASE 
            WHEN v_passing_score IS NOT NULL THEN v_percentage >= v_passing_score
            ELSE v_percentage >= 50
        END,
        updated_at = NOW()
    WHERE id = p_attempt_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Fonction: Auto-noter les questions objectives
-- ============================================
CREATE OR REPLACE FUNCTION auto_grade_response()
RETURNS TRIGGER AS $$
DECLARE
    v_question RECORD;
    v_is_correct BOOLEAN := false;
    v_points_earned DECIMAL(10, 2) := 0;
    v_student_answer JSONB;
    v_correct_answer JSONB;
BEGIN
    -- Récupérer les informations de la question
    SELECT * INTO v_question
    FROM evaluation_questions
    WHERE id = NEW.question_id;
    
    v_student_answer := NEW.student_answer;
    v_correct_answer := v_question.correct_answer;
    
    -- Auto-noter selon le type de question
    CASE v_question.question_type
        WHEN 'MCQ' THEN
            IF v_student_answer = v_correct_answer THEN
                v_is_correct := true;
                v_points_earned := v_question.points;
            END IF;
            NEW.auto_graded := true;
            
        WHEN 'TRUE_FALSE' THEN
            IF v_student_answer = v_correct_answer THEN
                v_is_correct := true;
                v_points_earned := v_question.points;
            END IF;
            NEW.auto_graded := true;
            
        WHEN 'MULTIPLE_SELECT' THEN
            -- Vérifier si les réponses correspondent exactement
            IF v_student_answer @> v_correct_answer AND v_correct_answer @> v_student_answer THEN
                v_is_correct := true;
                v_points_earned := v_question.points;
            ELSIF v_question.partial_credit THEN
                -- Crédit partiel: points proportionnels aux bonnes réponses
                DECLARE
                    v_correct_count INTEGER;
                    v_total_correct INTEGER;
                BEGIN
                    SELECT COUNT(*) INTO v_correct_count
                    FROM jsonb_array_elements_text(v_student_answer) s
                    WHERE s IN (SELECT jsonb_array_elements_text(v_correct_answer));
                    
                    SELECT jsonb_array_length(v_correct_answer) INTO v_total_correct;
                    
                    IF v_total_correct > 0 THEN
                        v_points_earned := (v_correct_count::DECIMAL / v_total_correct) * v_question.points;
                    END IF;
                END;
            END IF;
            NEW.auto_graded := true;
            
        WHEN 'SHORT_ANSWER' THEN
            -- Comparaison simple (insensible à la casse et aux espaces)
            IF LOWER(TRIM(v_student_answer::TEXT)) = LOWER(TRIM(v_correct_answer::TEXT)) THEN
                v_is_correct := true;
                v_points_earned := v_question.points;
            -- Vérifier si la réponse est dans une liste de réponses acceptables
            ELSIF jsonb_typeof(v_correct_answer) = 'array' THEN
                IF EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(v_correct_answer) ca
                    WHERE LOWER(TRIM(ca)) = LOWER(TRIM(v_student_answer::TEXT))
                ) THEN
                    v_is_correct := true;
                    v_points_earned := v_question.points;
                END IF;
            END IF;
            NEW.auto_graded := true;
            
        ELSE
            -- ESSAY, FILE_UPLOAD: nécessite une correction manuelle
            NEW.auto_graded := false;
    END CASE;
    
    NEW.is_correct := v_is_correct;
    NEW.points_earned := v_points_earned;
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-noter
DROP TRIGGER IF EXISTS trigger_auto_grade_response ON evaluation_responses;
CREATE TRIGGER trigger_auto_grade_response
    BEFORE INSERT OR UPDATE ON evaluation_responses
    FOR EACH ROW
    EXECUTE FUNCTION auto_grade_response();

-- ============================================
-- Fonction: Mettre à jour total_points
-- ============================================
CREATE OR REPLACE FUNCTION update_evaluation_total_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE evaluations
    SET total_points = COALESCE((
        SELECT SUM(points) FROM evaluation_questions WHERE evaluation_id = COALESCE(NEW.evaluation_id, OLD.evaluation_id)
    ), 0),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.evaluation_id, OLD.evaluation_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_total_points ON evaluation_questions;
CREATE TRIGGER trigger_update_total_points
    AFTER INSERT OR UPDATE OR DELETE ON evaluation_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_evaluation_total_points();

-- ============================================
-- Données de test (optionnel)
-- ============================================
/*
-- Exemple d'insertion d'une évaluation de type TP
INSERT INTO evaluations (
    title, description, instructions, evaluation_type,
    course_id, teacher_id,
    start_date, end_date, duration_minutes,
    total_points, plagiarism_check, status
) VALUES (
    'TP1 - Introduction à Python',
    'Premier travail pratique sur les bases de Python',
    'Répondez aux questions et soumettez votre code source.',
    'TP',
    (SELECT id FROM courses LIMIT 1),
    (SELECT id FROM users WHERE role = 'TEACHER' LIMIT 1),
    NOW(),
    NOW() + INTERVAL '7 days',
    NULL, -- Pas de limite de temps pour un TP
    100,
    true, -- Vérification anti-plagiat activée
    'ACTIVE'
);

-- Exemple de question FILE_UPLOAD pour TP
INSERT INTO evaluation_questions (
    evaluation_id, question_text, question_type,
    points, order_index, file_types_allowed, max_file_size
) VALUES (
    (SELECT id FROM evaluations WHERE title = 'TP1 - Introduction à Python'),
    'Soumettez votre fichier Python contenant la solution de l''exercice 1.',
    'FILE_UPLOAD',
    50,
    1,
    '[".py", ".ipynb"]',
    5
);
*/

-- ============================================
-- Commentaires finaux
-- ============================================
COMMENT ON TABLE evaluations IS 'Table principale des évaluations (examens, TP, TD, projets, etc.)';
COMMENT ON TABLE evaluation_questions IS 'Questions associées aux évaluations';
COMMENT ON TABLE evaluation_attempts IS 'Tentatives/soumissions des étudiants';
COMMENT ON TABLE evaluation_responses IS 'Réponses individuelles aux questions';
COMMENT ON TABLE submission_files IS 'Fichiers téléversés par les étudiants';
COMMENT ON TABLE plagiarism_reports IS 'Rapports d''analyse anti-plagiat';

COMMENT ON COLUMN evaluations.plagiarism_check IS 'Active la vérification anti-plagiat pour cette évaluation';
COMMENT ON COLUMN evaluations.similarity_threshold IS 'Seuil de similarité (%) à partir duquel une soumission est marquée comme suspecte';
COMMENT ON COLUMN evaluation_attempts.plagiarism_score IS 'Score de similarité global (0-100%) détecté par l''analyse anti-plagiat';

-- Fin du script de migration
