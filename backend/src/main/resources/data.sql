-- ============================================================
-- CampusConnect – BRACU Course Catalog Seed Data
-- Source: Official BRAC University curriculum
-- Inserted only if table is empty (idempotent)
-- ============================================================

INSERT INTO course_catalog (code, name, faculty_id, credits, year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT * FROM (VALUES

-- ── CSE (Computer Science & Engineering) ────────────────────────────────────
('CSE110', 'Programming Language I',           'cse', 3, 1, 'Spring', 'Dr. Md. Haider Ali',         88,  120, 4.7, 'Core,Beginner',           'Introduction to computation, problem analysis, and algorithm development. Covers programming concepts, control structures, loops, data structures, and debugging using Java.'),
('CSE111', 'Programming Language II',          'cse', 3, 1, 'Fall',   'Prof. Mosaddek Hossain',     80,  100, 4.6, 'Core,Lab',                'Object-Oriented Programming: classes, objects, inheritance, encapsulation, polymorphism, and abstract data types. Includes a compulsory 3-hour lab session.'),
('CSE220', 'Data Structures',                  'cse', 3, 2, 'Fall',   'Dr. Sadia Islam',            78,  100, 4.8, 'Core,Lab,Competitive',    'Elementary data structures including arrays, linked lists, stacks, queues, and trees. Searching, sorting, and tree traversal algorithms. Includes mandatory lab.'),
('CSE221', 'Algorithm Analysis & Design',      'cse', 3, 2, 'Spring', 'Dr. Md. Haider Ali',         72,   90, 4.9, 'Core,Lab,Competitive',    'Efficient algorithm design techniques: divide and conquer, greedy methods, dynamic programming, backtracking, graph algorithms, and NP-completeness with complexity analysis.'),
('CSE260', 'Digital Logic Design',             'cse', 3, 2, 'Fall',   'Dr. A.K.M. Nazrul Islam',    70,   90, 4.4, 'Core,Lab',                'Boolean algebra, logic gates, combinational and sequential circuits, flip-flops, registers, counters, and basic digital system design.'),
('CSE321', 'Operating Systems',                'cse', 3, 3, 'Fall',   'Prof. Mosaddek Hossain',     65,   80, 4.5, 'Core',                    'Process management, threads, synchronization, inter-process communication, memory management, file systems, storage, resource management, and deadlock handling.'),
('CSE330', 'Numerical Methods',                'cse', 3, 3, 'Spring', 'Dr. Amitabha Chakrabarty',   60,   80, 4.3, 'Core,Practical',          'Fixed-point arithmetic, polynomial interpolation, differentiation, nonlinear and linear equations, Gaussian elimination, QR decomposition, and numerical integration.'),
('CSE331', 'Automata and Computability',       'cse', 3, 3, 'Fall',   'Dr. Shazzad Hosain',         55,   70, 4.4, 'Core',                    'Theory of computation: finite automata (DFA, NFA), regular expressions, context-free grammars, pushdown automata, and Turing machines.'),
('CSE340', 'Computer Architecture',            'cse', 3, 3, 'Spring', 'Dr. A.K.M. Nazrul Islam',    60,   80, 4.5, 'Core',                    'Systematic study of computer design: instruction sets (RISC-V), memory hierarchy, pipelining, cache design, and parallel architecture.'),
('CSE370', 'Database Systems',                 'cse', 3, 3, 'Fall',   'Dr. Md. Faizul Bari',        75,  100, 4.6, 'Core,Practical',          'Relational model, ER diagrams, SQL, normalization, transactions, indexing, query optimization, and introduction to NoSQL databases.'),
('CSE420', 'Compiler Design',                  'cse', 4, 4, 'Spring', 'Dr. Shazzad Hosain',         45,   60, 4.4, 'Core,Advanced',           'Lexical analysis, parsing, semantic analysis, intermediate code generation, optimization, and code generation. Includes a compiler construction project.'),
('CSE421', 'Computer Networks',                'cse', 3, 4, 'Fall',   'Dr. Md. Faizul Bari',        60,   80, 4.5, 'Core',                    'Network layered architectures, TCP/IP protocol suite, routing algorithms, congestion control, network security, and network programming applications.'),
('CSE422', 'Artificial Intelligence',          'cse', 3, 4, 'Spring', 'Dr. Amitabha Chakrabarty',   58,   70, 4.7, 'Elective,Advanced,Lab',   'Intelligent agents, problem-solving search strategies, constraint satisfaction, propositional and first-order logic, probabilistic reasoning, and intro to machine learning.'),
('CSE470', 'Software Engineering',             'cse', 3, 4, 'Fall',   'Dr. Sadia Islam',            65,   80, 4.8, 'Core,Capstone',           'Software development lifecycle, requirements engineering, system design, UML modeling, testing strategies, project management, and Agile/Scrum methodology.'),
('CSE400', 'Project/Thesis',                   'cse', 4, 4, 'Summer', 'Dr. Md. Haider Ali',         40,   45, 4.9, 'Capstone',                'Independent final-year project or thesis. Students design, implement, test, and present a significant software system under faculty supervision.'),

-- ── EEE (Electrical & Electronic Engineering) ───────────────────────────────
('EEE101', 'Electrical Circuits I',            'eee', 3, 1, 'Fall',   'Dr. Celia Shahnaz',          90,  120, 4.5, 'Core,Lab',                'KVL, KCL, mesh and nodal analysis, Thevenin/Norton theorem, superposition, source transformation, and transient response of RC/RL circuits.'),
('EEE201', 'Electrical Circuits II',           'eee', 3, 2, 'Spring', 'Dr. Celia Shahnaz',          80,  100, 4.4, 'Core,Lab',                'Sinusoidal steady-state analysis, phasors, AC circuit power, frequency response, Bode plots, resonance, and two-port networks.'),
('EEE203', 'Electronic Circuits I',            'eee', 3, 2, 'Fall',   'Dr. Satya Prasad Majumder',  75,  100, 4.5, 'Core,Lab',                'Diodes, BJTs, MOSFETs, biasing, small-signal models, single-stage amplifiers, and frequency response of amplifier circuits.'),
('EEE208', 'Signals and Systems',              'eee', 3, 2, 'Spring', 'Dr. Md. Fokhrul Islam',      70,   90, 4.4, 'Core',                    'Continuous and discrete-time signals, LTI systems, convolution, Fourier series/transform, Laplace transform, and Z-transform.'),
('EEE308', 'Electronic Circuits II',           'eee', 3, 3, 'Fall',   'Dr. Satya Prasad Majumder',  65,   80, 4.5, 'Core,Lab',                'Multi-stage amplifiers, differential amplifiers, feedback theory, operational amplifiers, active filters, and oscillator circuits.'),
('EEE315', 'Microprocessors & Interfacing',    'eee', 3, 3, 'Spring', 'Dr. Md. Fokhrul Islam',      60,   75, 4.6, 'Core,Lab,Practical',      'ARM microcontroller architecture, assembly language, I/O interfacing, interrupts, timers, ADC/DAC, serial communication, and embedded system design.'),
('EEE321', 'Digital Signal Processing',        'eee', 3, 3, 'Fall',   'Dr. Celia Shahnaz',          55,   70, 4.5, 'Core,Advanced',           'Discrete-time signals and systems, Z-transform, DFT, FFT algorithm, FIR and IIR filter design and implementation.'),
('EEE401', 'Power System Analysis',            'eee', 3, 4, 'Spring', 'Dr. Mohammad Ali',           50,   65, 4.3, 'Core,Advanced',           'Power system components, load flow analysis, fault analysis, symmetrical components, power system stability, and protection relays.'),
('EEE411', 'Renewable Energy Systems',         'eee', 3, 4, 'Fall',   'Dr. Saifur Rahman',          48,   60, 4.6, 'Elective,Advanced',       'Solar photovoltaic, wind turbines, hydropower, fuel cells, grid integration, energy storage systems, and Bangladesh energy policy.'),
('EEE450', 'Communication Systems',            'eee', 3, 4, 'Spring', 'Dr. Md. Fokhrul Islam',      52,   65, 4.5, 'Core',                    'Analog and digital modulation, AM/FM/PM, PCM, multiplexing, channel capacity, error correction coding, and wireless communication fundamentals.'),

-- ── BBA (BRAC Business School) ──────────────────────────────────────────────
('BUS101', 'Introduction to Business',         'bba', 3, 1, 'Fall',   'Dr. Syed Akhter Hossain',   140,  180, 4.4, 'Core,Beginner',           'Overview of business organization, types of businesses, functional areas (marketing, finance, HR, operations), and the business environment in Bangladesh.'),
('ECO101', 'Microeconomics',                   'bba', 3, 1, 'Spring', 'Dr. Nazneen Ahmed',          130,  170, 4.5, 'Core,Beginner',           'Supply and demand, elasticity, consumer theory, production and cost, market structures (perfect competition, monopoly, oligopoly), and market failures.'),
('ECO102', 'Macroeconomics',                   'bba', 3, 1, 'Fall',   'Dr. Nazneen Ahmed',          120,  160, 4.4, 'Core,Beginner',           'National income accounts, GDP, inflation, unemployment, IS-LM model, fiscal and monetary policy, balance of payments, and economic growth theories.'),
('ACC101', 'Financial Accounting',             'bba', 3, 2, 'Spring', 'Dr. Mahbub Ahmed',           110,  150, 4.3, 'Core',                    'Accounting cycle, journal entries, trial balance, income statements, balance sheets, cash flow statements, and interpretation of financial reports per GAAP.'),
('MGT201', 'Principles of Management',         'bba', 3, 2, 'Fall',   'Dr. Syed Akhter Hossain',   100,  140, 4.5, 'Core',                    'Planning, organizing, leading, and controlling. Classical and contemporary management theories, organizational design, decision-making, and leadership styles.'),
('MKT301', 'Marketing Management',             'bba', 3, 3, 'Spring', 'Dr. Mujib Rahman',            90,  120, 4.6, 'Core',                    'Marketing concepts, segmentation, targeting, positioning, marketing mix (4Ps), consumer behavior, brand management, and digital marketing in Bangladesh.'),
('FIN301', 'Financial Management',             'bba', 3, 3, 'Fall',   'Dr. Mahbub Ahmed',            85,  110, 4.5, 'Core',                    'Time value of money, capital budgeting (NPV, IRR), capital structure, dividend policy, working capital management, and financial risk analysis.'),
('MGT401', 'Strategic Management',             'bba', 3, 4, 'Spring', 'Dr. Syed Akhter Hossain',    75,  100, 4.7, 'Core,Advanced',           'Porter''s Five Forces, SWOT analysis, competitive advantage, corporate strategy, BCG matrix, mergers & acquisitions, and strategic leadership.'),
('FIN401', 'Investment Analysis',              'bba', 3, 4, 'Fall',   'Dr. Mahbub Ahmed',            65,   85, 4.6, 'Elective,Advanced',       'Portfolio theory, CAPM, equity valuation, bond pricing, derivatives (options and futures), and risk management in the Bangladesh capital market.'),
('MKT402', 'Digital Marketing & E-Commerce',  'bba', 3, 4, 'Summer', 'Dr. Mujib Rahman',            60,   75, 4.8, 'Elective,Practical',      'SEO/SEM, social media marketing, content strategy, e-commerce platforms, digital analytics, and running effective digital campaigns.'),

-- ── General Education (shared across departments) ────────────────────────────
('ENG101', 'English & Communication Skills I', 'eng', 3, 1, 'Fall',   'Dr. Niaz Zaman',            200,  240, 4.5, 'Core,Beginner,GenEd',     'Academic essay writing, thesis development, research skills, citations, and academic conventions. Foundation for university-level writing.'),
('ENG102', 'English & Communication Skills II','eng', 3, 1, 'Spring', 'Dr. Niaz Zaman',            190,  240, 4.6, 'Core,Beginner,GenEd',     'Advanced academic writing, critical reading, argumentation, presentation skills, and professional communication for university students.'),
('MAT110', 'Mathematics I',                    'math',3, 1, 'Fall',   'Dr. M. A. Rashid',          180,  220, 4.3, 'Core,Foundational,GenEd', 'Limits, continuity, differentiation, integration, and applications of calculus. Fundamental for all engineering and science programs at BRACU.'),
('MAT120', 'Mathematics II',                   'math',3, 1, 'Spring', 'Dr. M. A. Rashid',          160,  200, 4.4, 'Core,Foundational',       'Multivariable calculus, partial derivatives, multiple integrals, vector calculus, sequences and series, and differential equations.'),
('MAT215', 'Mathematics III (Linear Algebra)', 'math',3, 2, 'Fall',   'Dr. Satya Ranjan Chakrabarty',130,170, 4.5,'Core',                    'Vectors and matrices, systems of linear equations, determinants, eigenvalues and eigenvectors, linear transformations, and vector spaces.'),
('MAT216', 'Mathematics IV (Statistics)',      'math',3, 2, 'Spring', 'Dr. Satya Ranjan Chakrabarty',120,160, 4.4,'Core,Practical',          'Probability theory, random variables, distributions, hypothesis testing, confidence intervals, regression analysis, and ANOVA.'),
('PHY111', 'Physics I (Mechanics)',            'math',3, 1, 'Fall',   'Dr. Zahirul Islam',         160,  200, 4.2, 'Core,Lab,GenEd',          'Kinematics, Newton''s laws, work-energy theorem, rotational motion, gravitation, oscillations, waves, and introduction to fluid mechanics.'),
('PHY112', 'Physics II (Electromagnetism)',    'math',3, 1, 'Spring', 'Dr. Zahirul Islam',         150,  190, 4.3, 'Core,Lab,GenEd',          'Electrostatics, electric potential, capacitance, DC/AC circuits, magnetic fields, electromagnetic induction, and Maxwell''s equations.')

) AS v(code, name, faculty_id, credits, year, semester, instructor, enrolled, capacity, rating, tags, description)
WHERE NOT EXISTS (SELECT 1 FROM course_catalog LIMIT 1);

-- ============================================================
-- CampusConnect – BRACU Course Section Seed Data
-- Time slots follow BRACU's standard scheduling system.
-- ============================================================

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT * FROM (VALUES

-- ── CSE110 – Programming Language I ─────────────────────────────────────────
('CSE110-01','CSE110','01','Programming Language I','Dr. Haider Ali',   'SUN-TUE 08:00 AM-09:20 AM','UB40-404','Dec 10, 2026 9:00 AM-11:00 AM',40,35),
('CSE110-02','CSE110','02','Programming Language I','Dr. Haider Ali',   'MON-WED 09:30 AM-10:50 AM','UB40-405','Dec 10, 2026 9:00 AM-11:00 AM',40,38),
('CSE110-03','CSE110','03','Programming Language I','Mr. Tanvir Ahmed', 'SUN-TUE 11:00 AM-12:20 PM','UB40-406','Dec 10, 2026 9:00 AM-11:00 AM',40,22),
('CSE110-04','CSE110','04','Programming Language I','Mr. Tanvir Ahmed', 'TUE-THU 09:30 AM-10:50 AM','UB40-301','Dec 10, 2026 9:00 AM-11:00 AM',40,40),
('CSE110-05','CSE110','05','Programming Language I','Ms. Nadia Farhan', 'MON-WED 11:00 AM-12:20 PM','UB40-302','Dec 10, 2026 9:00 AM-11:00 AM',40,18),
('CSE110-06','CSE110','06','Programming Language I','Ms. Nadia Farhan', 'SUN-TUE 12:30 PM-01:50 PM','UB40-303','Dec 10, 2026 9:00 AM-11:00 AM',40,30),
('CSE110-07','CSE110','07','Programming Language I','Dr. Haider Ali',   'MON-WED 02:00 PM-03:20 PM','UB40-304','Dec 10, 2026 9:00 AM-11:00 AM',40,26),
('CSE110-08','CSE110','08','Programming Language I','Mr. Tanvir Ahmed', 'TUE-THU 11:00 AM-12:20 PM','UB40-401','Dec 10, 2026 9:00 AM-11:00 AM',40,40),
('CSE110-09','CSE110','09','Programming Language I','Ms. Nadia Farhan', 'SUN-TUE 03:30 PM-04:50 PM','UB40-402','Dec 10, 2026 9:00 AM-11:00 AM',40,12),
('CSE110-10','CSE110','10','Programming Language I','Dr. Haider Ali',   'MON-WED 03:30 PM-04:50 PM','UB40-403','Dec 10, 2026 9:00 AM-11:00 AM',40,20),

-- ── CSE220 – Data Structures ─────────────────────────────────────────────────
('CSE220-01','CSE220','01','Data Structures','Dr. Sadia Islam',   'MON-WED 08:00 AM-09:20 AM','UB40-501','Dec 12, 2026 2:00 PM-4:00 PM',35,33),
('CSE220-02','CSE220','02','Data Structures','Dr. Sadia Islam',   'SUN-TUE 09:30 AM-10:50 AM','UB40-502','Dec 12, 2026 2:00 PM-4:00 PM',35,20),
('CSE220-03','CSE220','03','Data Structures','Prof. Mosaddek',    'TUE-THU 08:00 AM-09:20 AM','UB40-503','Dec 12, 2026 2:00 PM-4:00 PM',35,35),
('CSE220-04','CSE220','04','Data Structures','Prof. Mosaddek',    'MON-WED 11:00 AM-12:20 PM','UB40-504','Dec 12, 2026 2:00 PM-4:00 PM',35,14),
('CSE220-05','CSE220','05','Data Structures','Dr. Sadia Islam',   'SUN-TUE 11:00 AM-12:20 PM','UB40-601','Dec 12, 2026 2:00 PM-4:00 PM',35,28),
('CSE220-06','CSE220','06','Data Structures','Mr. Raisul Islam',  'TUE-THU 12:30 PM-01:50 PM','UB40-602','Dec 12, 2026 2:00 PM-4:00 PM',35,31),
('CSE220-07','CSE220','07','Data Structures','Mr. Raisul Islam',  'MON-WED 12:30 PM-01:50 PM','UB40-603','Dec 12, 2026 2:00 PM-4:00 PM',35,10),
('CSE220-08','CSE220','08','Data Structures','Prof. Mosaddek',    'SUN-TUE 02:00 PM-03:20 PM','UB40-604','Dec 12, 2026 2:00 PM-4:00 PM',35,22),
('CSE220-09','CSE220','09','Data Structures','Dr. Sadia Islam',   'TUE-THU 03:30 PM-04:50 PM','UB40-701','Dec 12, 2026 2:00 PM-4:00 PM',35,35),
('CSE220-10','CSE220','10','Data Structures','Mr. Raisul Islam',  'MON-WED 03:30 PM-04:50 PM','UB40-702','Dec 12, 2026 2:00 PM-4:00 PM',35,16),

-- ── CSE221 – Algorithm Analysis & Design ─────────────────────────────────────
('CSE221-01','CSE221','01','Algorithm Analysis & Design','Dr. Haider Ali',   'SUN-TUE 08:00 AM-09:20 AM','UB40-703','Dec 14, 2026 9:00 AM-11:00 AM',40,40),
('CSE221-02','CSE221','02','Algorithm Analysis & Design','Dr. Haider Ali',   'MON-WED 09:30 AM-10:50 AM','UB40-704','Dec 14, 2026 9:00 AM-11:00 AM',40,25),
('CSE221-03','CSE221','03','Algorithm Analysis & Design','Ms. Sumaiya Alam', 'TUE-THU 08:00 AM-09:20 AM','UB40-801','Dec 14, 2026 9:00 AM-11:00 AM',40,38),
('CSE221-04','CSE221','04','Algorithm Analysis & Design','Ms. Sumaiya Alam', 'MON-WED 11:00 AM-12:20 PM','UB40-802','Dec 14, 2026 9:00 AM-11:00 AM',40,18),
('CSE221-05','CSE221','05','Algorithm Analysis & Design','Dr. Haider Ali',   'SUN-TUE 11:00 AM-12:20 PM','UB40-803','Dec 14, 2026 9:00 AM-11:00 AM',40,32),
('CSE221-06','CSE221','06','Algorithm Analysis & Design','Dr. Shazzad Hosain','TUE-THU 11:00 AM-12:20 PM','UB40-804','Dec 14, 2026 9:00 AM-11:00 AM',40,40),
('CSE221-07','CSE221','07','Algorithm Analysis & Design','Dr. Shazzad Hosain','MON-WED 02:00 PM-03:20 PM','UB40-901','Dec 14, 2026 9:00 AM-11:00 AM',40,20),
('CSE221-08','CSE221','08','Algorithm Analysis & Design','Ms. Sumaiya Alam', 'TUE-THU 02:00 PM-03:20 PM','UB40-902','Dec 14, 2026 9:00 AM-11:00 AM',40,37),
('CSE221-09','CSE221','09','Algorithm Analysis & Design','Dr. Shazzad Hosain','SUN-TUE 03:30 PM-04:50 PM','UB40-903','Dec 14, 2026 9:00 AM-11:00 AM',40,12),
('CSE221-10','CSE221','10','Algorithm Analysis & Design','Dr. Haider Ali',   'MON-WED 03:30 PM-04:50 PM','UB40-904','Dec 14, 2026 9:00 AM-11:00 AM',40,28),

-- ── CSE370 – Database Systems ─────────────────────────────────────────────────
('CSE370-01','CSE370','01','Database Systems','Dr. Faizul Bari',   'SUN-TUE 08:00 AM-09:20 AM','TARC-301','Dec 16, 2026 2:00 PM-4:00 PM',38,30),
('CSE370-02','CSE370','02','Database Systems','Dr. Faizul Bari',   'MON-WED 08:00 AM-09:20 AM','TARC-302','Dec 16, 2026 2:00 PM-4:00 PM',38,38),
('CSE370-03','CSE370','03','Database Systems','Ms. Tahmina Hossain','TUE-THU 08:00 AM-09:20 AM','TARC-303','Dec 16, 2026 2:00 PM-4:00 PM',38,14),
('CSE370-04','CSE370','04','Database Systems','Ms. Tahmina Hossain','SUN-TUE 09:30 AM-10:50 AM','TARC-401','Dec 16, 2026 2:00 PM-4:00 PM',38,28),
('CSE370-05','CSE370','05','Database Systems','Dr. Faizul Bari',   'MON-WED 11:00 AM-12:20 PM','TARC-402','Dec 16, 2026 2:00 PM-4:00 PM',38,38),
('CSE370-06','CSE370','06','Database Systems','Mr. Wahid Bhuiyan', 'TUE-THU 11:00 AM-12:20 PM','TARC-403','Dec 16, 2026 2:00 PM-4:00 PM',38,22),
('CSE370-07','CSE370','07','Database Systems','Mr. Wahid Bhuiyan', 'SUN-TUE 12:30 PM-01:50 PM','TARC-404','Dec 16, 2026 2:00 PM-4:00 PM',38,6),
('CSE370-08','CSE370','08','Database Systems','Ms. Tahmina Hossain','MON-WED 12:30 PM-01:50 PM','TARC-501','Dec 16, 2026 2:00 PM-4:00 PM',38,35),
('CSE370-09','CSE370','09','Database Systems','Mr. Wahid Bhuiyan', 'TUE-THU 02:00 PM-03:20 PM','TARC-502','Dec 16, 2026 2:00 PM-4:00 PM',38,38),
('CSE370-10','CSE370','10','Database Systems','Dr. Faizul Bari',   'SUN-TUE 05:00 PM-06:20 PM','TARC-503','Dec 16, 2026 2:00 PM-4:00 PM',38,18),

-- ── CSE470 – Software Engineering ────────────────────────────────────────────
('CSE470-01','CSE470','01','Software Engineering','Dr. Sadia Islam',  'MON-WED 08:00 AM-09:20 AM','TARC-601','Dec 18, 2026 9:00 AM-11:00 AM',35,35),
('CSE470-02','CSE470','02','Software Engineering','Dr. Sadia Islam',  'SUN-TUE 09:30 AM-10:50 AM','TARC-602','Dec 18, 2026 9:00 AM-11:00 AM',35,22),
('CSE470-03','CSE470','03','Software Engineering','Ms. Runa Laila',   'TUE-THU 09:30 AM-10:50 AM','TARC-603','Dec 18, 2026 9:00 AM-11:00 AM',35,30),
('CSE470-04','CSE470','04','Software Engineering','Ms. Runa Laila',   'MON-WED 11:00 AM-12:20 PM','TARC-604','Dec 18, 2026 9:00 AM-11:00 AM',35,18),
('CSE470-05','CSE470','05','Software Engineering','Dr. Sadia Islam',  'SUN-TUE 12:30 PM-01:50 PM','TARC-701','Dec 18, 2026 9:00 AM-11:00 AM',35,35),
('CSE470-06','CSE470','06','Software Engineering','Mr. Shahriar Emon','TUE-THU 12:30 PM-01:50 PM','TARC-702','Dec 18, 2026 9:00 AM-11:00 AM',35,12),
('CSE470-07','CSE470','07','Software Engineering','Mr. Shahriar Emon','MON-WED 02:00 PM-03:20 PM','TARC-703','Dec 18, 2026 9:00 AM-11:00 AM',35,28),
('CSE470-08','CSE470','08','Software Engineering','Ms. Runa Laila',   'TUE-THU 02:00 PM-03:20 PM','TARC-704','Dec 18, 2026 9:00 AM-11:00 AM',35,35),
('CSE470-09','CSE470','09','Software Engineering','Mr. Shahriar Emon','SUN-TUE 03:30 PM-04:50 PM','TARC-801','Dec 18, 2026 9:00 AM-11:00 AM',35,8),
('CSE470-10','CSE470','10','Software Engineering','Dr. Sadia Islam',  'MON-WED 03:30 PM-04:50 PM','TARC-802','Dec 18, 2026 9:00 AM-11:00 AM',35,24),

-- ── CSE321 – Operating Systems ────────────────────────────────────────────────
('CSE321-01','CSE321','01','Operating Systems','Prof. Mosaddek',    'SUN-TUE 08:00 AM-09:20 AM','TARC-803','Dec 20, 2026 2:00 PM-4:00 PM',40,40),
('CSE321-02','CSE321','02','Operating Systems','Prof. Mosaddek',    'MON-WED 09:30 AM-10:50 AM','TARC-804','Dec 20, 2026 2:00 PM-4:00 PM',40,24),
('CSE321-03','CSE321','03','Operating Systems','Dr. Rezaul Karim',  'TUE-THU 08:00 AM-09:20 AM','UB40-101','Dec 20, 2026 2:00 PM-4:00 PM',40,36),
('CSE321-04','CSE321','04','Operating Systems','Dr. Rezaul Karim',  'MON-WED 11:00 AM-12:20 PM','UB40-102','Dec 20, 2026 2:00 PM-4:00 PM',40,16),
('CSE321-05','CSE321','05','Operating Systems','Prof. Mosaddek',    'SUN-TUE 11:00 AM-12:20 PM','UB40-103','Dec 20, 2026 2:00 PM-4:00 PM',40,30),
('CSE321-06','CSE321','06','Operating Systems','Ms. Khadija Begum', 'TUE-THU 11:00 AM-12:20 PM','UB40-201','Dec 20, 2026 2:00 PM-4:00 PM',40,40),
('CSE321-07','CSE321','07','Operating Systems','Ms. Khadija Begum', 'MON-WED 02:00 PM-03:20 PM','UB40-202','Dec 20, 2026 2:00 PM-4:00 PM',40,18),
('CSE321-08','CSE321','08','Operating Systems','Dr. Rezaul Karim',  'TUE-THU 02:00 PM-03:20 PM','UB40-203','Dec 20, 2026 2:00 PM-4:00 PM',40,38),
('CSE321-09','CSE321','09','Operating Systems','Ms. Khadija Begum', 'SUN-TUE 03:30 PM-04:50 PM','UB40-204','Dec 20, 2026 2:00 PM-4:00 PM',40,10),
('CSE321-10','CSE321','10','Operating Systems','Prof. Mosaddek',    'MON-WED 03:30 PM-04:50 PM','UB40-301','Dec 20, 2026 2:00 PM-4:00 PM',40,27),

-- ── MAT110 – Mathematics I ───────────────────────────────────────────────────
('MAT110-01','MAT110','01','Mathematics I','Dr. M. A. Rashid',        'SUN-TUE 08:00 AM-09:20 AM','UB30-201','Dec 22, 2026 9:00 AM-11:00 AM',45,45),
('MAT110-02','MAT110','02','Mathematics I','Dr. M. A. Rashid',        'MON-WED 08:00 AM-09:20 AM','UB30-202','Dec 22, 2026 9:00 AM-11:00 AM',45,40),
('MAT110-03','MAT110','03','Mathematics I','Ms. Sharmin Sultana',     'TUE-THU 09:30 AM-10:50 AM','UB30-203','Dec 22, 2026 9:00 AM-11:00 AM',45,38),
('MAT110-04','MAT110','04','Mathematics I','Ms. Sharmin Sultana',     'MON-WED 11:00 AM-12:20 PM','UB30-301','Dec 22, 2026 9:00 AM-11:00 AM',45,22),
('MAT110-05','MAT110','05','Mathematics I','Dr. Satya Chakrabarty',   'SUN-TUE 11:00 AM-12:20 PM','UB30-302','Dec 22, 2026 9:00 AM-11:00 AM',45,45),
('MAT110-06','MAT110','06','Mathematics I','Dr. Satya Chakrabarty',   'TUE-THU 11:00 AM-12:20 PM','UB30-303','Dec 22, 2026 9:00 AM-11:00 AM',45,30),
('MAT110-07','MAT110','07','Mathematics I','Dr. M. A. Rashid',        'MON-WED 12:30 PM-01:50 PM','UB30-401','Dec 22, 2026 9:00 AM-11:00 AM',45,45),
('MAT110-08','MAT110','08','Mathematics I','Ms. Sharmin Sultana',     'SUN-TUE 02:00 PM-03:20 PM','UB30-402','Dec 22, 2026 9:00 AM-11:00 AM',45,18),
('MAT110-09','MAT110','09','Mathematics I','Dr. Satya Chakrabarty',   'TUE-THU 02:00 PM-03:20 PM','UB30-403','Dec 22, 2026 9:00 AM-11:00 AM',45,42),
('MAT110-10','MAT110','10','Mathematics I','Dr. M. A. Rashid',        'MON-WED 03:30 PM-04:50 PM','UB30-404','Dec 22, 2026 9:00 AM-11:00 AM',45,25),

-- ── ENG101 – English & Communication Skills I ────────────────────────────────
('ENG101-01','ENG101','01','English & Communication Skills I','Dr. Niaz Zaman',    'SUN-TUE 08:00 AM-09:20 AM','SB-201','Dec 24, 2026 2:00 PM-4:00 PM',40,38),
('ENG101-02','ENG101','02','English & Communication Skills I','Dr. Niaz Zaman',    'MON-WED 09:30 AM-10:50 AM','SB-202','Dec 24, 2026 2:00 PM-4:00 PM',40,40),
('ENG101-03','ENG101','03','English & Communication Skills I','Ms. Farhana Akter', 'TUE-THU 08:00 AM-09:20 AM','SB-203','Dec 24, 2026 2:00 PM-4:00 PM',40,25),
('ENG101-04','ENG101','04','English & Communication Skills I','Ms. Farhana Akter', 'MON-WED 11:00 AM-12:20 PM','SB-301','Dec 24, 2026 2:00 PM-4:00 PM',40,35),
('ENG101-05','ENG101','05','English & Communication Skills I','Mr. Iftekhar Uddin','SUN-TUE 11:00 AM-12:20 PM','SB-302','Dec 24, 2026 2:00 PM-4:00 PM',40,20),
('ENG101-06','ENG101','06','English & Communication Skills I','Mr. Iftekhar Uddin','TUE-THU 11:00 AM-12:20 PM','SB-303','Dec 24, 2026 2:00 PM-4:00 PM',40,40),
('ENG101-07','ENG101','07','English & Communication Skills I','Dr. Niaz Zaman',    'MON-WED 12:30 PM-01:50 PM','SB-401','Dec 24, 2026 2:00 PM-4:00 PM',40,32),
('ENG101-08','ENG101','08','English & Communication Skills I','Ms. Farhana Akter', 'SUN-TUE 02:00 PM-03:20 PM','SB-402','Dec 24, 2026 2:00 PM-4:00 PM',40,15),
('ENG101-09','ENG101','09','English & Communication Skills I','Mr. Iftekhar Uddin','TUE-THU 02:00 PM-03:20 PM','SB-403','Dec 24, 2026 2:00 PM-4:00 PM',40,38),
('ENG101-10','ENG101','10','English & Communication Skills I','Dr. Niaz Zaman',    'MON-WED 03:30 PM-04:50 PM','SB-501','Dec 24, 2026 2:00 PM-4:00 PM',40,22)

) AS v(id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
WHERE NOT EXISTS (SELECT 1 FROM course_section LIMIT 1);
