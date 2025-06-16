/*
  # Create Universities and Courses Tables

  1. New Tables
    - `universities`
      - Complete university information including rankings, contact details, and metadata
    - `courses`
      - Course/program information linked to universities
      - Includes admission requirements, fees, and prerequisites

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (universities are public information)
    - Admin-only write access for data management

  3. Indexes
    - Performance indexes for common queries
    - Full-text search capabilities
    - Foreign key relationships

  4. Constraints
    - Data validation for enums and ranges
    - Proper foreign key relationships
*/

-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  area_description text,
  website_url text,
  contact_email text,
  global_ranking integer,
  research_ranking integer,
  student_population integer,
  acceptance_rate decimal(5,2) CHECK (acceptance_rate >= 0 AND acceptance_rate <= 100),
  average_tuition_fee decimal(10,2),
  extracurriculars text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  course_name text NOT NULL,
  department text NOT NULL,
  degree_type text NOT NULL CHECK (degree_type IN ('Bachelors', 'Masters', 'PhD', 'Diploma')),
  course_duration text,
  credit_hours integer,
  tuition_fee decimal(10,2),
  application_deadline date,
  requires_ielts boolean DEFAULT false,
  ielts_min_score decimal(3,1) CHECK (ielts_min_score >= 0 AND ielts_min_score <= 9),
  requires_toefl boolean DEFAULT false,
  toefl_min_score integer CHECK (toefl_min_score >= 0 AND toefl_min_score <= 120),
  prerequisites text,
  program_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policies for universities (public read access)
CREATE POLICY "Allow public read access to universities"
  ON universities
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read universities"
  ON universities
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for courses (public read access)
CREATE POLICY "Allow public read access to courses"
  ON courses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_universities_country ON universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_global_ranking ON universities(global_ranking);
CREATE INDEX IF NOT EXISTS idx_universities_acceptance_rate ON universities(acceptance_rate);
CREATE INDEX IF NOT EXISTS idx_universities_tuition_fee ON universities(average_tuition_fee);

CREATE INDEX IF NOT EXISTS idx_courses_university_id ON courses(university_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_name ON courses(course_name);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_degree_type ON courses(degree_type);
CREATE INDEX IF NOT EXISTS idx_courses_tuition_fee ON courses(tuition_fee);
CREATE INDEX IF NOT EXISTS idx_courses_application_deadline ON courses(application_deadline);
CREATE INDEX IF NOT EXISTS idx_courses_ielts_score ON courses(ielts_min_score);
CREATE INDEX IF NOT EXISTS idx_courses_toefl_score ON courses(toefl_min_score);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_universities_search ON universities USING gin(to_tsvector('english', name || ' ' || COALESCE(area_description, '')));
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses USING gin(to_tsvector('english', course_name || ' ' || department || ' ' || COALESCE(prerequisites, '')));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO universities (
  name, country, city, area_description, website_url, contact_email,
  global_ranking, research_ranking, student_population, acceptance_rate,
  average_tuition_fee, extracurriculars
) VALUES 
(
  'Stanford University',
  'United States',
  'Stanford',
  'Located in the heart of Silicon Valley, Stanford offers a beautiful suburban campus with state-of-the-art facilities and close proximity to tech companies.',
  'https://www.stanford.edu',
  'admission@stanford.edu',
  2,
  1,
  17000,
  4.3,
  56169.00,
  'Over 650 student organizations, Division I athletics, entrepreneurship clubs, research societies, cultural groups'
),
(
  'Massachusetts Institute of Technology',
  'United States',
  'Cambridge',
  'Urban campus in Cambridge, Massachusetts, known for its cutting-edge research facilities and innovation ecosystem.',
  'https://www.mit.edu',
  'admissions@mit.edu',
  1,
  2,
  11500,
  6.7,
  53790.00,
  'Hackathons, robotics clubs, entrepreneurship programs, 33 varsity sports, music and arts groups'
),
(
  'University of Oxford',
  'United Kingdom',
  'Oxford',
  'Historic collegiate university in the medieval city of Oxford, featuring traditional architecture and world-renowned libraries.',
  'https://www.ox.ac.uk',
  'undergraduate.admissions@admin.ox.ac.uk',
  4,
  5,
  24000,
  17.5,
  35000.00,
  'Over 400 clubs and societies, rowing, debating societies, drama groups, academic societies'
),
(
  'University of Toronto',
  'Canada',
  'Toronto',
  'Large urban campus in downtown Toronto, offering diverse academic programs and multicultural environment.',
  'https://www.utoronto.ca',
  'admissions@utoronto.ca',
  18,
  12,
  97000,
  43.0,
  25000.00,
  'Over 1000 student clubs, varsity athletics, research opportunities, cultural organizations'
),
(
  'Technical University of Munich',
  'Germany',
  'Munich',
  'Modern campus with excellent engineering and technology facilities, located in the vibrant city of Munich.',
  'https://www.tum.de',
  'studium@tum.de',
  50,
  25,
  45000,
  25.0,
  0.00,
  'Student organizations, sports clubs, international exchange programs, research groups'
);

-- Insert sample courses
INSERT INTO courses (
  university_id, course_name, department, degree_type, course_duration,
  credit_hours, tuition_fee, application_deadline, requires_ielts, ielts_min_score,
  requires_toefl, toefl_min_score, prerequisites, program_url
) VALUES 
-- Stanford University courses
(
  (SELECT id FROM universities WHERE name = 'Stanford University'),
  'Master of Science in Computer Science',
  'Computer Science',
  'Masters',
  '2 years',
  45,
  56169.00,
  '2024-12-15',
  true,
  7.0,
  true,
  100,
  'Bachelor''s degree in Computer Science or related field, strong mathematical background, programming experience',
  'https://www.stanford.edu/academics/graduate-programs/computer-science'
),
(
  (SELECT id FROM universities WHERE name = 'Stanford University'),
  'Master of Business Administration',
  'Graduate School of Business',
  'Masters',
  '2 years',
  60,
  73062.00,
  '2024-04-10',
  true,
  7.5,
  true,
  105,
  'Bachelor''s degree, GMAT/GRE scores, work experience preferred',
  'https://www.gsb.stanford.edu/programs/mba'
),
-- MIT courses
(
  (SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'),
  'Master of Engineering in Electrical Engineering',
  'Electrical Engineering and Computer Science',
  'Masters',
  '1 year',
  66,
  53790.00,
  '2024-12-15',
  true,
  7.0,
  true,
  100,
  'Bachelor''s degree in Electrical Engineering or related field, strong mathematics and physics background',
  'https://www.eecs.mit.edu/academics/graduate-programs'
),
(
  (SELECT id FROM universities WHERE name = 'Massachusetts Institute of Technology'),
  'Doctor of Philosophy in Physics',
  'Physics',
  'PhD',
  '5-6 years',
  120,
  53790.00,
  '2024-12-15',
  true,
  7.0,
  true,
  100,
  'Bachelor''s degree in Physics or related field, strong mathematical background, research experience',
  'https://web.mit.edu/physics/prospective/graduate'
),
-- Oxford courses
(
  (SELECT id FROM universities WHERE name = 'University of Oxford'),
  'Master of Science in Computer Science',
  'Department of Computer Science',
  'Masters',
  '1 year',
  180,
  35000.00,
  '2024-01-20',
  true,
  7.5,
  true,
  110,
  'First-class or strong upper second-class undergraduate degree in Computer Science or related field',
  'https://www.cs.ox.ac.uk/admissions/graduate'
),
(
  (SELECT id FROM universities WHERE name = 'University of Oxford'),
  'Master of Business Administration',
  'Saïd Business School',
  'Masters',
  '1 year',
  180,
  65520.00,
  '2024-01-12',
  true,
  7.5,
  true,
  110,
  'Bachelor''s degree, GMAT/GRE scores, minimum 3 years work experience',
  'https://www.sbs.ox.ac.uk/programmes/mbas/oxford-mba'
),
-- University of Toronto courses
(
  (SELECT id FROM universities WHERE name = 'University of Toronto'),
  'Master of Applied Science in Engineering',
  'Faculty of Applied Science & Engineering',
  'Masters',
  '2 years',
  20,
  25000.00,
  '2024-01-15',
  true,
  6.5,
  true,
  93,
  'Bachelor''s degree in Engineering with B+ average or higher',
  'https://www.engineering.utoronto.ca/graduate'
),
(
  (SELECT id FROM universities WHERE name = 'University of Toronto'),
  'Master of Information',
  'Faculty of Information',
  'Masters',
  '2 years',
  20,
  28000.00,
  '2024-02-01',
  true,
  6.5,
  true,
  93,
  'Bachelor''s degree with B+ average, statement of interest, relevant experience',
  'https://ischool.utoronto.ca/programs/master-of-information'
),
-- TUM courses
(
  (SELECT id FROM universities WHERE name = 'Technical University of Munich'),
  'Master of Science in Informatics',
  'Department of Informatics',
  'Masters',
  '2 years',
  120,
  0.00,
  '2024-05-31',
  true,
  6.5,
  true,
  88,
  'Bachelor''s degree in Computer Science or related field with good grades',
  'https://www.in.tum.de/en/studies/degree-programs/master-informatics'
),
(
  (SELECT id FROM universities WHERE name = 'Technical University of Munich'),
  'Master of Science in Mechanical Engineering',
  'Department of Mechanical Engineering',
  'Masters',
  '2 years',
  120,
  0.00,
  '2024-05-31',
  true,
  6.5,
  true,
  88,
  'Bachelor''s degree in Mechanical Engineering or related field',
  'https://www.mw.tum.de/en/studies/degree-programs'
);