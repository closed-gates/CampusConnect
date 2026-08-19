-- ============================================================
-- CampusConnect – BRACU Course Catalog Seed Data
-- Source: Official BRAC University curriculum
-- Inserted only if table is empty (idempotent)
-- ============================================================

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE110', 'Programming Language I', 'cse', 3, 1, 'Spring', 'Dr. Md. Haider Ali', 88, 120, 4.7, 'Core,Beginner', 'Introduction to computation, problem analysis, and algorithm development. Covers programming concepts, control structures, loops, data structures, and debugging using Java.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog LIMIT 1);

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE111', 'Programming Language II', 'cse', 3, 1, 'Fall', 'Prof. Mosaddek Hossain', 80, 100, 4.6, 'Core,Lab', 'Object-Oriented Programming: classes, objects, inheritance, encapsulation, polymorphism, and abstract data types. Includes a compulsory 3-hour lab session.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE111');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE220', 'Data Structures', 'cse', 3, 2, 'Fall', 'Dr. Sadia Islam', 78, 100, 4.8, 'Core,Lab,Competitive', 'Elementary data structures including arrays, linked lists, stacks, queues, and trees. Searching, sorting, and tree traversal algorithms. Includes mandatory lab.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE220');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE221', 'Algorithm Analysis & Design', 'cse', 3, 2, 'Spring', 'Dr. Md. Haider Ali', 72, 90, 4.9, 'Core,Lab,Competitive', 'Efficient algorithm design techniques: divide and conquer, greedy methods, dynamic programming, backtracking, graph algorithms, and NP-completeness with complexity analysis.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE221');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE260', 'Digital Logic Design', 'cse', 3, 2, 'Fall', 'Dr. A.K.M. Nazrul Islam', 70, 90, 4.4, 'Core,Lab', 'Boolean algebra, logic gates, combinational and sequential circuits, flip-flops, registers, counters, and basic digital system design.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE260');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE321', 'Operating Systems', 'cse', 3, 3, 'Fall', 'Prof. Mosaddek Hossain', 65, 80, 4.5, 'Core', 'Process management, threads, synchronization, inter-process communication, memory management, file systems, storage, resource management, and deadlock handling.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE321');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE330', 'Numerical Methods', 'cse', 3, 3, 'Spring', 'Dr. Amitabha Chakrabarty', 60, 80, 4.3, 'Core,Practical', 'Fixed-point arithmetic, polynomial interpolation, differentiation, nonlinear and linear equations, Gaussian elimination, QR decomposition, and numerical integration.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE330');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE331', 'Automata and Computability', 'cse', 3, 3, 'Fall', 'Dr. Shazzad Hosain', 55, 70, 4.4, 'Core', 'Theory of computation: finite automata (DFA, NFA), regular expressions, context-free grammars, pushdown automata, and Turing machines.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE331');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE340', 'Computer Architecture', 'cse', 3, 3, 'Spring', 'Dr. A.K.M. Nazrul Islam', 60, 80, 4.5, 'Core', 'Systematic study of computer design: instruction sets (RISC-V), memory hierarchy, pipelining, cache design, and parallel architecture.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE340');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE370', 'Database Systems', 'cse', 3, 3, 'Fall', 'Dr. Md. Faizul Bari', 75, 100, 4.6, 'Core,Practical', 'Relational model, ER diagrams, SQL, normalization, transactions, indexing, query optimization, and introduction to NoSQL databases.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE370');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE420', 'Compiler Design', 'cse', 4, 4, 'Spring', 'Dr. Shazzad Hosain', 45, 60, 4.4, 'Core,Advanced', 'Lexical analysis, parsing, semantic analysis, intermediate code generation, optimization, and code generation. Includes a compiler construction project.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE420');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE421', 'Computer Networks', 'cse', 3, 4, 'Fall', 'Dr. Md. Faizul Bari', 60, 80, 4.5, 'Core', 'Network layered architectures, TCP/IP protocol suite, routing algorithms, congestion control, network security, and network programming applications.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE421');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE422', 'Artificial Intelligence', 'cse', 3, 4, 'Spring', 'Dr. Amitabha Chakrabarty', 58, 70, 4.7, 'Elective,Advanced,Lab', 'Intelligent agents, problem-solving search strategies, constraint satisfaction, propositional and first-order logic, probabilistic reasoning, and intro to machine learning.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE422');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE470', 'Software Engineering', 'cse', 3, 4, 'Fall', 'Dr. Sadia Islam', 65, 80, 4.8, 'Core,Capstone', 'Software development lifecycle, requirements engineering, system design, UML modeling, testing strategies, project management, and Agile/Scrum methodology.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE470');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'CSE400', 'Project/Thesis', 'cse', 4, 4, 'Summer', 'Dr. Md. Haider Ali', 40, 45, 4.9, 'Capstone', 'Independent final-year project or thesis. Students design, implement, test, and present a significant software system under faculty supervision.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'CSE400');

-- EEE
INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE101', 'Electrical Circuits I', 'eee', 3, 1, 'Fall', 'Dr. Celia Shahnaz', 90, 120, 4.5, 'Core,Lab', 'KVL, KCL, mesh and nodal analysis, Thevenin/Norton theorem, superposition, source transformation, and transient response of RC/RL circuits.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE101');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE201', 'Electrical Circuits II', 'eee', 3, 2, 'Spring', 'Dr. Celia Shahnaz', 80, 100, 4.4, 'Core,Lab', 'Sinusoidal steady-state analysis, phasors, AC circuit power, frequency response, Bode plots, resonance, and two-port networks.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE201');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE203', 'Electronic Circuits I', 'eee', 3, 2, 'Fall', 'Dr. Satya Prasad Majumder', 75, 100, 4.5, 'Core,Lab', 'Diodes, BJTs, MOSFETs, biasing, small-signal models, single-stage amplifiers, and frequency response of amplifier circuits.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE203');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE208', 'Signals and Systems', 'eee', 3, 2, 'Spring', 'Dr. Md. Fokhrul Islam', 70, 90, 4.4, 'Core', 'Continuous and discrete-time signals, LTI systems, convolution, Fourier series/transform, Laplace transform, and Z-transform.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE208');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE308', 'Electronic Circuits II', 'eee', 3, 3, 'Fall', 'Dr. Satya Prasad Majumder', 65, 80, 4.5, 'Core,Lab', 'Multi-stage amplifiers, differential amplifiers, feedback theory, operational amplifiers, active filters, and oscillator circuits.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE308');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE315', 'Microprocessors & Interfacing', 'eee', 3, 3, 'Spring', 'Dr. Md. Fokhrul Islam', 60, 75, 4.6, 'Core,Lab,Practical', 'ARM microcontroller architecture, assembly language, I/O interfacing, interrupts, timers, ADC/DAC, serial communication, and embedded system design.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE315');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE321', 'Digital Signal Processing', 'eee', 3, 3, 'Fall', 'Dr. Celia Shahnaz', 55, 70, 4.5, 'Core,Advanced', 'Discrete-time signals and systems, Z-transform, DFT, FFT algorithm, FIR and IIR filter design and implementation.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE321');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE401', 'Power System Analysis', 'eee', 3, 4, 'Spring', 'Dr. Mohammad Ali', 50, 65, 4.3, 'Core,Advanced', 'Power system components, load flow analysis, fault analysis, symmetrical components, power system stability, and protection relays.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE401');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE411', 'Renewable Energy Systems', 'eee', 3, 4, 'Fall', 'Dr. Saifur Rahman', 48, 60, 4.6, 'Elective,Advanced', 'Solar photovoltaic, wind turbines, hydropower, fuel cells, grid integration, energy storage systems, and Bangladesh energy policy.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE411');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'EEE450', 'Communication Systems', 'eee', 3, 4, 'Spring', 'Dr. Md. Fokhrul Islam', 52, 65, 4.5, 'Core', 'Analog and digital modulation, AM/FM/PM, PCM, multiplexing, channel capacity, error correction coding, and wireless communication fundamentals.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'EEE450');

-- BBA
INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'BUS101', 'Introduction to Business', 'bba', 3, 1, 'Fall', 'Dr. Syed Akhter Hossain', 140, 180, 4.4, 'Core,Beginner', 'Overview of business organization, types of businesses, functional areas (marketing, finance, HR, operations), and the business environment in Bangladesh.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'BUS101');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'ECO101', 'Microeconomics', 'bba', 3, 1, 'Spring', 'Dr. Nazneen Ahmed', 130, 170, 4.5, 'Core,Beginner', 'Supply and demand, elasticity, consumer theory, production and cost, market structures (perfect competition, monopoly, oligopoly), and market failures.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'ECO101');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'ECO102', 'Macroeconomics', 'bba', 3, 1, 'Fall', 'Dr. Nazneen Ahmed', 120, 160, 4.4, 'Core,Beginner', 'National income accounts, GDP, inflation, unemployment, IS-LM model, fiscal and monetary policy, balance of payments, and economic growth theories.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'ECO102');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'ACC101', 'Financial Accounting', 'bba', 3, 2, 'Spring', 'Dr. Mahbub Ahmed', 110, 150, 4.3, 'Core', 'Accounting cycle, journal entries, trial balance, income statements, balance sheets, cash flow statements, and interpretation of financial reports per GAAP.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'ACC101');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MGT201', 'Principles of Management', 'bba', 3, 2, 'Fall', 'Dr. Syed Akhter Hossain', 100, 140, 4.5, 'Core', 'Planning, organizing, leading, and controlling. Classical and contemporary management theories, organizational design, decision-making, and leadership styles.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MGT201');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MKT301', 'Marketing Management', 'bba', 3, 3, 'Spring', 'Dr. Mujib Rahman', 90, 120, 4.6, 'Core', 'Marketing concepts, segmentation, targeting, positioning, marketing mix (4Ps), consumer behavior, brand management, and digital marketing in Bangladesh.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MKT301');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'FIN301', 'Financial Management', 'bba', 3, 3, 'Fall', 'Dr. Mahbub Ahmed', 85, 110, 4.5, 'Core', 'Time value of money, capital budgeting (NPV, IRR), capital structure, dividend policy, working capital management, and financial risk analysis.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'FIN301');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MGT401', 'Strategic Management', 'bba', 3, 4, 'Spring', 'Dr. Syed Akhter Hossain', 75, 100, 4.7, 'Core,Advanced', 'Porter''s Five Forces, SWOT analysis, competitive advantage, corporate strategy, BCG matrix, mergers & acquisitions, and strategic leadership.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MGT401');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'FIN401', 'Investment Analysis', 'bba', 3, 4, 'Fall', 'Dr. Mahbub Ahmed', 65, 85, 4.6, 'Elective,Advanced', 'Portfolio theory, CAPM, equity valuation, bond pricing, derivatives (options and futures), and risk management in the Bangladesh capital market.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'FIN401');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MKT402', 'Digital Marketing & E-Commerce', 'bba', 3, 4, 'Summer', 'Dr. Mujib Rahman', 60, 75, 4.8, 'Elective,Practical', 'SEO/SEM, social media marketing, content strategy, e-commerce platforms, digital analytics, and running effective digital campaigns.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MKT402');

-- General Education
INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'ENG101', 'English & Communication Skills I', 'eng', 3, 1, 'Fall', 'Dr. Niaz Zaman', 200, 240, 4.5, 'Core,Beginner,GenEd', 'Academic essay writing, thesis development, research skills, citations, and academic conventions. Foundation for university-level writing.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'ENG101');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'ENG102', 'English & Communication Skills II', 'eng', 3, 1, 'Spring', 'Dr. Niaz Zaman', 190, 240, 4.6, 'Core,Beginner,GenEd', 'Advanced academic writing, critical reading, argumentation, presentation skills, and professional communication for university students.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'ENG102');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MAT110', 'Mathematics I', 'math', 3, 1, 'Fall', 'Dr. M. A. Rashid', 180, 220, 4.3, 'Core,Foundational,GenEd', 'Limits, continuity, differentiation, integration, and applications of calculus. Fundamental for all engineering and science programs at BRACU.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MAT110');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MAT120', 'Mathematics II', 'math', 3, 1, 'Spring', 'Dr. M. A. Rashid', 160, 200, 4.4, 'Core,Foundational', 'Multivariable calculus, partial derivatives, multiple integrals, vector calculus, sequences and series, and differential equations.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MAT120');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MAT215', 'Mathematics III (Linear Algebra)', 'math', 3, 2, 'Fall', 'Dr. Satya Ranjan Chakrabarty', 130, 170, 4.5, 'Core', 'Vectors and matrices, systems of linear equations, determinants, eigenvalues and eigenvectors, linear transformations, and vector spaces.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MAT215');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'MAT216', 'Mathematics IV (Statistics)', 'math', 3, 2, 'Spring', 'Dr. Satya Ranjan Chakrabarty', 120, 160, 4.4, 'Core,Practical', 'Probability theory, random variables, distributions, hypothesis testing, confidence intervals, regression analysis, and ANOVA.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'MAT216');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'PHY111', 'Physics I (Mechanics)', 'math', 3, 1, 'Fall', 'Dr. Zahirul Islam', 160, 200, 4.2, 'Core,Lab,GenEd', 'Kinematics, Newton''s laws, work-energy theorem, rotational motion, gravitation, oscillations, waves, and introduction to fluid mechanics.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'PHY111');

INSERT INTO course_catalog (code, name, faculty_id, credits, academic_year, semester, instructor, enrolled, capacity, rating, tags, description)
SELECT 'PHY112', 'Physics II (Electromagnetism)', 'math', 3, 1, 'Spring', 'Dr. Zahirul Islam', 150, 190, 4.3, 'Core,Lab,GenEd', 'Electrostatics, electric potential, capacitance, DC/AC circuits, magnetic fields, electromagnetic induction, and Maxwell''s equations.'
WHERE NOT EXISTS (SELECT 1 FROM course_catalog WHERE code = 'PHY112');

-- ============================================================
-- CampusConnect – BRACU Course Section Seed Data
-- Time slots follow BRACU''s standard scheduling system.
-- ============================================================

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-01','CSE110','01','Programming Language I','Dr. Haider Ali','SUN-TUE 08:00 AM-09:20 AM','UB40-404','Dec 10, 2026 9:00 AM-11:00 AM',40,35
WHERE NOT EXISTS (SELECT 1 FROM course_section LIMIT 1);

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-02','CSE110','02','Programming Language I','Dr. Haider Ali','MON-WED 09:30 AM-10:50 AM','UB40-405','Dec 10, 2026 9:00 AM-11:00 AM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-03','CSE110','03','Programming Language I','Mr. Tanvir Ahmed','SUN-TUE 11:00 AM-12:20 PM','UB40-406','Dec 10, 2026 9:00 AM-11:00 AM',40,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-04','CSE110','04','Programming Language I','Mr. Tanvir Ahmed','TUE-THU 09:30 AM-10:50 AM','UB40-301','Dec 10, 2026 9:00 AM-11:00 AM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-05','CSE110','05','Programming Language I','Ms. Nadia Farhan','MON-WED 11:00 AM-12:20 PM','UB40-302','Dec 10, 2026 9:00 AM-11:00 AM',40,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-06','CSE110','06','Programming Language I','Ms. Nadia Farhan','SUN-TUE 12:30 PM-01:50 PM','UB40-303','Dec 10, 2026 9:00 AM-11:00 AM',40,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-07','CSE110','07','Programming Language I','Dr. Haider Ali','MON-WED 02:00 PM-03:20 PM','UB40-304','Dec 10, 2026 9:00 AM-11:00 AM',40,26
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-08','CSE110','08','Programming Language I','Mr. Tanvir Ahmed','TUE-THU 11:00 AM-12:20 PM','UB40-401','Dec 10, 2026 9:00 AM-11:00 AM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-09','CSE110','09','Programming Language I','Ms. Nadia Farhan','SUN-TUE 03:30 PM-04:50 PM','UB40-402','Dec 10, 2026 9:00 AM-11:00 AM',40,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE110-10','CSE110','10','Programming Language I','Dr. Haider Ali','MON-WED 03:30 PM-04:50 PM','UB40-403','Dec 10, 2026 9:00 AM-11:00 AM',40,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE110-10');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-01','CSE220','01','Data Structures','Dr. Sadia Islam','MON-WED 08:00 AM-09:20 AM','UB40-501','Dec 12, 2026 2:00 PM-4:00 PM',35,33
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-01');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-02','CSE220','02','Data Structures','Dr. Sadia Islam','SUN-TUE 09:30 AM-10:50 AM','UB40-502','Dec 12, 2026 2:00 PM-4:00 PM',35,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-03','CSE220','03','Data Structures','Prof. Mosaddek','TUE-THU 08:00 AM-09:20 AM','UB40-503','Dec 12, 2026 2:00 PM-4:00 PM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-04','CSE220','04','Data Structures','Prof. Mosaddek','MON-WED 11:00 AM-12:20 PM','UB40-504','Dec 12, 2026 2:00 PM-4:00 PM',35,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-05','CSE220','05','Data Structures','Dr. Sadia Islam','SUN-TUE 11:00 AM-12:20 PM','UB40-601','Dec 12, 2026 2:00 PM-4:00 PM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-06','CSE220','06','Data Structures','Mr. Raisul Islam','TUE-THU 12:30 PM-01:50 PM','UB40-602','Dec 12, 2026 2:00 PM-4:00 PM',35,31
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-07','CSE220','07','Data Structures','Mr. Raisul Islam','MON-WED 12:30 PM-01:50 PM','UB40-603','Dec 12, 2026 2:00 PM-4:00 PM',35,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-08','CSE220','08','Data Structures','Prof. Mosaddek','SUN-TUE 02:00 PM-03:20 PM','UB40-604','Dec 12, 2026 2:00 PM-4:00 PM',35,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-09','CSE220','09','Data Structures','Dr. Sadia Islam','TUE-THU 03:30 PM-04:50 PM','UB40-701','Dec 12, 2026 2:00 PM-4:00 PM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE220-10','CSE220','10','Data Structures','Mr. Raisul Islam','MON-WED 03:30 PM-04:50 PM','UB40-702','Dec 12, 2026 2:00 PM-4:00 PM',35,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE220-10');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-01','CSE221','01','Algorithm Analysis & Design','Dr. Haider Ali','SUN-TUE 08:00 AM-09:20 AM','UB40-703','Dec 14, 2026 9:00 AM-11:00 AM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-01');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-02','CSE221','02','Algorithm Analysis & Design','Dr. Haider Ali','MON-WED 09:30 AM-10:50 AM','UB40-704','Dec 14, 2026 9:00 AM-11:00 AM',40,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-03','CSE221','03','Algorithm Analysis & Design','Ms. Sumaiya Alam','TUE-THU 08:00 AM-09:20 AM','UB40-801','Dec 14, 2026 9:00 AM-11:00 AM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-04','CSE221','04','Algorithm Analysis & Design','Ms. Sumaiya Alam','MON-WED 11:00 AM-12:20 PM','UB40-802','Dec 14, 2026 9:00 AM-11:00 AM',40,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-05','CSE221','05','Algorithm Analysis & Design','Dr. Haider Ali','SUN-TUE 11:00 AM-12:20 PM','UB40-803','Dec 14, 2026 9:00 AM-11:00 AM',40,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-06','CSE221','06','Algorithm Analysis & Design','Dr. Shazzad Hosain','TUE-THU 11:00 AM-12:20 PM','UB40-804','Dec 14, 2026 9:00 AM-11:00 AM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-07','CSE221','07','Algorithm Analysis & Design','Dr. Shazzad Hosain','MON-WED 02:00 PM-03:20 PM','UB40-901','Dec 14, 2026 9:00 AM-11:00 AM',40,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-08','CSE221','08','Algorithm Analysis & Design','Ms. Sumaiya Alam','TUE-THU 02:00 PM-03:20 PM','UB40-902','Dec 14, 2026 9:00 AM-11:00 AM',40,37
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-09','CSE221','09','Algorithm Analysis & Design','Dr. Shazzad Hosain','SUN-TUE 03:30 PM-04:50 PM','UB40-903','Dec 14, 2026 9:00 AM-11:00 AM',40,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE221-10','CSE221','10','Algorithm Analysis & Design','Dr. Haider Ali','MON-WED 03:30 PM-04:50 PM','UB40-904','Dec 14, 2026 9:00 AM-11:00 AM',40,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE221-10');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-01','CSE370','01','Database Systems','Dr. Faizul Bari','SUN-TUE 08:00 AM-09:20 AM','TARC-301','Dec 16, 2026 2:00 PM-4:00 PM',38,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-01');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-02','CSE370','02','Database Systems','Dr. Faizul Bari','MON-WED 08:00 AM-09:20 AM','TARC-302','Dec 16, 2026 2:00 PM-4:00 PM',38,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-03','CSE370','03','Database Systems','Ms. Tahmina Hossain','TUE-THU 08:00 AM-09:20 AM','TARC-303','Dec 16, 2026 2:00 PM-4:00 PM',38,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-04','CSE370','04','Database Systems','Ms. Tahmina Hossain','SUN-TUE 09:30 AM-10:50 AM','TARC-401','Dec 16, 2026 2:00 PM-4:00 PM',38,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-05','CSE370','05','Database Systems','Dr. Faizul Bari','MON-WED 11:00 AM-12:20 PM','TARC-402','Dec 16, 2026 2:00 PM-4:00 PM',38,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-06','CSE370','06','Database Systems','Mr. Wahid Bhuiyan','TUE-THU 11:00 AM-12:20 PM','TARC-403','Dec 16, 2026 2:00 PM-4:00 PM',38,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-07','CSE370','07','Database Systems','Mr. Wahid Bhuiyan','SUN-TUE 12:30 PM-01:50 PM','TARC-404','Dec 16, 2026 2:00 PM-4:00 PM',38,6
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-08','CSE370','08','Database Systems','Ms. Tahmina Hossain','MON-WED 12:30 PM-01:50 PM','TARC-501','Dec 16, 2026 2:00 PM-4:00 PM',38,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-09','CSE370','09','Database Systems','Mr. Wahid Bhuiyan','TUE-THU 02:00 PM-03:20 PM','TARC-502','Dec 16, 2026 2:00 PM-4:00 PM',38,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE370-10','CSE370','10','Database Systems','Dr. Faizul Bari','SUN-TUE 05:00 PM-06:20 PM','TARC-503','Dec 16, 2026 2:00 PM-4:00 PM',38,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE370-10');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-01','CSE470','01','Software Engineering','Dr. Sadia Islam','MON-WED 08:00 AM-09:20 AM','TARC-601','Dec 18, 2026 9:00 AM-11:00 AM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-01');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-02','CSE470','02','Software Engineering','Dr. Sadia Islam','SUN-TUE 09:30 AM-10:50 AM','TARC-602','Dec 18, 2026 9:00 AM-11:00 AM',35,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-03','CSE470','03','Software Engineering','Ms. Runa Laila','TUE-THU 09:30 AM-10:50 AM','TARC-603','Dec 18, 2026 9:00 AM-11:00 AM',35,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-04','CSE470','04','Software Engineering','Ms. Runa Laila','MON-WED 11:00 AM-12:20 PM','TARC-604','Dec 18, 2026 9:00 AM-11:00 AM',35,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-05','CSE470','05','Software Engineering','Dr. Sadia Islam','SUN-TUE 12:30 PM-01:50 PM','TARC-701','Dec 18, 2026 9:00 AM-11:00 AM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-06','CSE470','06','Software Engineering','Mr. Shahriar Emon','TUE-THU 12:30 PM-01:50 PM','TARC-702','Dec 18, 2026 9:00 AM-11:00 AM',35,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-07','CSE470','07','Software Engineering','Mr. Shahriar Emon','MON-WED 02:00 PM-03:20 PM','TARC-703','Dec 18, 2026 9:00 AM-11:00 AM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-08','CSE470','08','Software Engineering','Ms. Runa Laila','TUE-THU 02:00 PM-03:20 PM','TARC-704','Dec 18, 2026 9:00 AM-11:00 AM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-09','CSE470','09','Software Engineering','Mr. Shahriar Emon','SUN-TUE 03:30 PM-04:50 PM','TARC-801','Dec 18, 2026 9:00 AM-11:00 AM',35,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE470-10','CSE470','10','Software Engineering','Dr. Sadia Islam','MON-WED 03:30 PM-04:50 PM','TARC-802','Dec 18, 2026 9:00 AM-11:00 AM',35,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE470-10');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-01','CSE321','01','Operating Systems','Prof. Mosaddek','SUN-TUE 08:00 AM-09:20 AM','TARC-803','Dec 20, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-01');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-02','CSE321','02','Operating Systems','Prof. Mosaddek','MON-WED 09:30 AM-10:50 AM','TARC-804','Dec 20, 2026 2:00 PM-4:00 PM',40,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-03','CSE321','03','Operating Systems','Dr. Rezaul Karim','TUE-THU 08:00 AM-09:20 AM','UB40-101','Dec 20, 2026 2:00 PM-4:00 PM',40,36
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-04','CSE321','04','Operating Systems','Dr. Rezaul Karim','MON-WED 11:00 AM-12:20 PM','UB40-102','Dec 20, 2026 2:00 PM-4:00 PM',40,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-05','CSE321','05','Operating Systems','Prof. Mosaddek','SUN-TUE 11:00 AM-12:20 PM','UB40-103','Dec 20, 2026 2:00 PM-4:00 PM',40,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-06','CSE321','06','Operating Systems','Ms. Khadija Begum','TUE-THU 11:00 AM-12:20 PM','UB40-201','Dec 20, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-07','CSE321','07','Operating Systems','Ms. Khadija Begum','MON-WED 02:00 PM-03:20 PM','UB40-202','Dec 20, 2026 2:00 PM-4:00 PM',40,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-08','CSE321','08','Operating Systems','Dr. Rezaul Karim','TUE-THU 02:00 PM-03:20 PM','UB40-203','Dec 20, 2026 2:00 PM-4:00 PM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-09','CSE321','09','Operating Systems','Ms. Khadija Begum','SUN-TUE 03:30 PM-04:50 PM','UB40-204','Dec 20, 2026 2:00 PM-4:00 PM',40,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE321-10','CSE321','10','Operating Systems','Prof. Mosaddek','MON-WED 03:30 PM-04:50 PM','UB40-301','Dec 20, 2026 2:00 PM-4:00 PM',40,27
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE321-10');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-01','MAT110','01','Mathematics I','Dr. M. A. Rashid','SUN-TUE 08:00 AM-09:20 AM','UB30-201','Dec 22, 2026 9:00 AM-11:00 AM',45,45
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-01');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-02','MAT110','02','Mathematics I','Dr. M. A. Rashid','MON-WED 08:00 AM-09:20 AM','UB30-202','Dec 22, 2026 9:00 AM-11:00 AM',45,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-03','MAT110','03','Mathematics I','Ms. Sharmin Sultana','TUE-THU 09:30 AM-10:50 AM','UB30-203','Dec 22, 2026 9:00 AM-11:00 AM',45,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-04','MAT110','04','Mathematics I','Ms. Sharmin Sultana','MON-WED 11:00 AM-12:20 PM','UB30-301','Dec 22, 2026 9:00 AM-11:00 AM',45,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-05','MAT110','05','Mathematics I','Dr. Satya Chakrabarty','SUN-TUE 11:00 AM-12:20 PM','UB30-302','Dec 22, 2026 9:00 AM-11:00 AM',45,45
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-06','MAT110','06','Mathematics I','Dr. Satya Chakrabarty','TUE-THU 11:00 AM-12:20 PM','UB30-303','Dec 22, 2026 9:00 AM-11:00 AM',45,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-07','MAT110','07','Mathematics I','Dr. M. A. Rashid','MON-WED 12:30 PM-01:50 PM','UB30-401','Dec 22, 2026 9:00 AM-11:00 AM',45,45
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-08','MAT110','08','Mathematics I','Ms. Sharmin Sultana','SUN-TUE 02:00 PM-03:20 PM','UB30-402','Dec 22, 2026 9:00 AM-11:00 AM',45,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-09','MAT110','09','Mathematics I','Dr. Satya Chakrabarty','TUE-THU 02:00 PM-03:20 PM','UB30-403','Dec 22, 2026 9:00 AM-11:00 AM',45,42
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT110-10','MAT110','10','Mathematics I','Dr. M. A. Rashid','MON-WED 03:30 PM-04:50 PM','UB30-404','Dec 22, 2026 9:00 AM-11:00 AM',45,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT110-10');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-01','ENG101','01','English & Communication Skills I','Dr. Niaz Zaman','SUN-TUE 08:00 AM-09:20 AM','SB-201','Dec 24, 2026 2:00 PM-4:00 PM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-01');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-02','ENG101','02','English & Communication Skills I','Dr. Niaz Zaman','MON-WED 09:30 AM-10:50 AM','SB-202','Dec 24, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-02');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-03','ENG101','03','English & Communication Skills I','Ms. Farhana Akter','TUE-THU 08:00 AM-09:20 AM','SB-203','Dec 24, 2026 2:00 PM-4:00 PM',40,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-03');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-04','ENG101','04','English & Communication Skills I','Ms. Farhana Akter','MON-WED 11:00 AM-12:20 PM','SB-301','Dec 24, 2026 2:00 PM-4:00 PM',40,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-04');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-05','ENG101','05','English & Communication Skills I','Mr. Iftekhar Uddin','SUN-TUE 11:00 AM-12:20 PM','SB-302','Dec 24, 2026 2:00 PM-4:00 PM',40,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-05');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-06','ENG101','06','English & Communication Skills I','Mr. Iftekhar Uddin','TUE-THU 11:00 AM-12:20 PM','SB-303','Dec 24, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-06');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-07','ENG101','07','English & Communication Skills I','Dr. Niaz Zaman','MON-WED 12:30 PM-01:50 PM','SB-401','Dec 24, 2026 2:00 PM-4:00 PM',40,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-07');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-08','ENG101','08','English & Communication Skills I','Ms. Farhana Akter','SUN-TUE 02:00 PM-03:20 PM','SB-402','Dec 24, 2026 2:00 PM-4:00 PM',40,15
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-08');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-09','ENG101','09','English & Communication Skills I','Mr. Iftekhar Uddin','TUE-THU 02:00 PM-03:20 PM','SB-403','Dec 24, 2026 2:00 PM-4:00 PM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-09');

INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG101-10','ENG101','10','English & Communication Skills I','Dr. Niaz Zaman','MON-WED 03:30 PM-04:50 PM','SB-501','Dec 24, 2026 2:00 PM-4:00 PM',40,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG101-10');

-- ============================================================
-- Additional Course Sections – All Remaining Catalog Courses
-- Exam dates match ExamScheduleService hardcoded values.
-- ============================================================

-- CSE111 – Programming Language II (Final: Dec 10, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE111-01','CSE111','01','Programming Language II','Prof. Mosaddek Hossain','SUN-TUE 08:00 AM-09:20 AM','AB1-101','Dec 10, 2026 2:00 PM-4:00 PM',35,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE111-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE111-02','CSE111','02','Programming Language II','Prof. Mosaddek Hossain','MON-WED 08:00 AM-09:20 AM','AB1-102','Dec 10, 2026 2:00 PM-4:00 PM',35,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE111-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE111-03','CSE111','03','Programming Language II','Mr. Tanvir Ahmed','TUE-THU 09:30 AM-10:50 AM','AB1-103','Dec 10, 2026 2:00 PM-4:00 PM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE111-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE111-04','CSE111','04','Programming Language II','Mr. Tanvir Ahmed','SUN-TUE 11:00 AM-12:20 PM','AB1-104','Dec 10, 2026 2:00 PM-4:00 PM',35,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE111-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE111-05','CSE111','05','Programming Language II','Ms. Nadia Farhan','MON-WED 12:30 PM-01:50 PM','AB1-201','Dec 10, 2026 2:00 PM-4:00 PM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE111-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE111-06','CSE111','06','Programming Language II','Ms. Nadia Farhan','TUE-THU 02:00 PM-03:20 PM','AB1-202','Dec 10, 2026 2:00 PM-4:00 PM',35,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE111-06');

-- CSE260 – Digital Logic Design (Final: Dec 12, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE260-01','CSE260','01','Digital Logic Design','Dr. A.K.M. Nazrul Islam','SUN-TUE 08:00 AM-09:20 AM','AB1-203','Dec 12, 2026 9:00 AM-11:00 AM',35,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE260-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE260-02','CSE260','02','Digital Logic Design','Dr. A.K.M. Nazrul Islam','MON-WED 09:30 AM-10:50 AM','AB1-204','Dec 12, 2026 9:00 AM-11:00 AM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE260-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE260-03','CSE260','03','Digital Logic Design','Mr. Raisul Islam','TUE-THU 08:00 AM-09:20 AM','AB1-301','Dec 12, 2026 9:00 AM-11:00 AM',35,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE260-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE260-04','CSE260','04','Digital Logic Design','Mr. Raisul Islam','SUN-TUE 11:00 AM-12:20 PM','AB1-302','Dec 12, 2026 9:00 AM-11:00 AM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE260-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE260-05','CSE260','05','Digital Logic Design','Dr. A.K.M. Nazrul Islam','MON-WED 02:00 PM-03:20 PM','AB1-303','Dec 12, 2026 9:00 AM-11:00 AM',35,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE260-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE260-06','CSE260','06','Digital Logic Design','Mr. Raisul Islam','TUE-THU 03:30 PM-04:50 PM','AB1-304','Dec 12, 2026 9:00 AM-11:00 AM',35,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE260-06');

-- CSE330 – Numerical Methods (Final: Dec 15, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE330-01','CSE330','01','Numerical Methods','Dr. Amitabha Chakrabarty','SUN-TUE 08:00 AM-09:20 AM','AB1-401','Dec 15, 2026 9:00 AM-11:00 AM',30,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE330-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE330-02','CSE330','02','Numerical Methods','Dr. Amitabha Chakrabarty','MON-WED 09:30 AM-10:50 AM','AB1-402','Dec 15, 2026 9:00 AM-11:00 AM',30,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE330-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE330-03','CSE330','03','Numerical Methods','Ms. Sumaiya Alam','TUE-THU 09:30 AM-10:50 AM','AB1-403','Dec 15, 2026 9:00 AM-11:00 AM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE330-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE330-04','CSE330','04','Numerical Methods','Ms. Sumaiya Alam','SUN-TUE 12:30 PM-01:50 PM','AB1-404','Dec 15, 2026 9:00 AM-11:00 AM',30,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE330-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE330-05','CSE330','05','Numerical Methods','Dr. Amitabha Chakrabarty','MON-WED 02:00 PM-03:20 PM','AB1-501','Dec 15, 2026 9:00 AM-11:00 AM',30,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE330-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE330-06','CSE330','06','Numerical Methods','Ms. Sumaiya Alam','TUE-THU 03:30 PM-04:50 PM','AB1-502','Dec 15, 2026 9:00 AM-11:00 AM',30,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE330-06');

-- CSE331 – Automata and Computability (Final: Dec 16, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE331-01','CSE331','01','Automata and Computability','Dr. Shazzad Hosain','SUN-TUE 08:00 AM-09:20 AM','AB1-503','Dec 16, 2026 2:00 PM-4:00 PM',30,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE331-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE331-02','CSE331','02','Automata and Computability','Dr. Shazzad Hosain','MON-WED 08:00 AM-09:20 AM','AB1-601','Dec 16, 2026 2:00 PM-4:00 PM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE331-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE331-03','CSE331','03','Automata and Computability','Dr. Rezaul Karim','TUE-THU 09:30 AM-10:50 AM','AB1-602','Dec 16, 2026 2:00 PM-4:00 PM',30,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE331-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE331-04','CSE331','04','Automata and Computability','Dr. Rezaul Karim','SUN-TUE 11:00 AM-12:20 PM','AB1-603','Dec 16, 2026 2:00 PM-4:00 PM',30,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE331-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE331-05','CSE331','05','Automata and Computability','Dr. Shazzad Hosain','MON-WED 02:00 PM-03:20 PM','AB1-604','Dec 16, 2026 2:00 PM-4:00 PM',30,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE331-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE331-06','CSE331','06','Automata and Computability','Dr. Rezaul Karim','TUE-THU 02:00 PM-03:20 PM','AB2-101','Dec 16, 2026 2:00 PM-4:00 PM',30,15
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE331-06');

-- CSE340 – Computer Architecture (Final: Dec 17, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE340-01','CSE340','01','Computer Architecture','Dr. A.K.M. Nazrul Islam','SUN-TUE 09:30 AM-10:50 AM','AB2-102','Dec 17, 2026 9:00 AM-11:00 AM',30,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE340-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE340-02','CSE340','02','Computer Architecture','Dr. A.K.M. Nazrul Islam','MON-WED 09:30 AM-10:50 AM','AB2-103','Dec 17, 2026 9:00 AM-11:00 AM',30,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE340-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE340-03','CSE340','03','Computer Architecture','Ms. Khadija Begum','TUE-THU 08:00 AM-09:20 AM','AB2-104','Dec 17, 2026 9:00 AM-11:00 AM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE340-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE340-04','CSE340','04','Computer Architecture','Ms. Khadija Begum','SUN-TUE 12:30 PM-01:50 PM','AB2-201','Dec 17, 2026 9:00 AM-11:00 AM',30,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE340-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE340-05','CSE340','05','Computer Architecture','Dr. A.K.M. Nazrul Islam','MON-WED 03:30 PM-04:50 PM','AB2-202','Dec 17, 2026 9:00 AM-11:00 AM',30,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE340-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE340-06','CSE340','06','Computer Architecture','Ms. Khadija Begum','TUE-THU 03:30 PM-04:50 PM','AB2-203','Dec 17, 2026 9:00 AM-11:00 AM',30,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE340-06');

-- CSE420 – Compiler Design (Final: Dec 19, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE420-01','CSE420','01','Compiler Design','Dr. Shazzad Hosain','SUN-TUE 08:00 AM-09:20 AM','AB2-204','Dec 19, 2026 9:00 AM-11:00 AM',25,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE420-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE420-02','CSE420','02','Compiler Design','Dr. Shazzad Hosain','MON-WED 09:30 AM-10:50 AM','AB2-301','Dec 19, 2026 9:00 AM-11:00 AM',25,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE420-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE420-03','CSE420','03','Compiler Design','Dr. Rezaul Karim','TUE-THU 09:30 AM-10:50 AM','AB2-302','Dec 19, 2026 9:00 AM-11:00 AM',25,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE420-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE420-04','CSE420','04','Compiler Design','Dr. Rezaul Karim','SUN-TUE 11:00 AM-12:20 PM','AB2-303','Dec 19, 2026 9:00 AM-11:00 AM',25,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE420-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE420-05','CSE420','05','Compiler Design','Dr. Shazzad Hosain','MON-WED 02:00 PM-03:20 PM','AB2-304','Dec 19, 2026 9:00 AM-11:00 AM',25,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE420-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE420-06','CSE420','06','Compiler Design','Dr. Rezaul Karim','TUE-THU 02:00 PM-03:20 PM','AB2-401','Dec 19, 2026 9:00 AM-11:00 AM',25,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE420-06');

-- CSE421 – Computer Networks (Final: Dec 19, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE421-01','CSE421','01','Computer Networks','Dr. Md. Faizul Bari','SUN-TUE 08:00 AM-09:20 AM','AB2-402','Dec 19, 2026 2:00 PM-4:00 PM',35,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE421-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE421-02','CSE421','02','Computer Networks','Dr. Md. Faizul Bari','MON-WED 08:00 AM-09:20 AM','AB2-403','Dec 19, 2026 2:00 PM-4:00 PM',35,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE421-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE421-03','CSE421','03','Computer Networks','Ms. Tahmina Hossain','TUE-THU 09:30 AM-10:50 AM','AB2-404','Dec 19, 2026 2:00 PM-4:00 PM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE421-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE421-04','CSE421','04','Computer Networks','Ms. Tahmina Hossain','SUN-TUE 11:00 AM-12:20 PM','AB2-501','Dec 19, 2026 2:00 PM-4:00 PM',35,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE421-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE421-05','CSE421','05','Computer Networks','Dr. Md. Faizul Bari','MON-WED 12:30 PM-01:50 PM','AB2-502','Dec 19, 2026 2:00 PM-4:00 PM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE421-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE421-06','CSE421','06','Computer Networks','Ms. Tahmina Hossain','TUE-THU 03:30 PM-04:50 PM','AB2-503','Dec 19, 2026 2:00 PM-4:00 PM',35,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE421-06');

-- CSE422 – Artificial Intelligence (Final: Dec 21, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE422-01','CSE422','01','Artificial Intelligence','Dr. Amitabha Chakrabarty','SUN-TUE 09:30 AM-10:50 AM','AB2-601','Dec 21, 2026 9:00 AM-11:00 AM',30,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE422-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE422-02','CSE422','02','Artificial Intelligence','Dr. Amitabha Chakrabarty','MON-WED 09:30 AM-10:50 AM','AB2-602','Dec 21, 2026 9:00 AM-11:00 AM',30,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE422-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE422-03','CSE422','03','Artificial Intelligence','Ms. Sumaiya Alam','TUE-THU 08:00 AM-09:20 AM','AB2-603','Dec 21, 2026 9:00 AM-11:00 AM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE422-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE422-04','CSE422','04','Artificial Intelligence','Ms. Sumaiya Alam','SUN-TUE 12:30 PM-01:50 PM','AB2-604','Dec 21, 2026 9:00 AM-11:00 AM',30,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE422-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE422-05','CSE422','05','Artificial Intelligence','Dr. Amitabha Chakrabarty','MON-WED 02:00 PM-03:20 PM','AB2-701','Dec 21, 2026 9:00 AM-11:00 AM',30,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE422-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE422-06','CSE422','06','Artificial Intelligence','Ms. Sumaiya Alam','TUE-THU 02:00 PM-03:20 PM','AB2-702','Dec 21, 2026 9:00 AM-11:00 AM',30,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE422-06');

-- CSE400 – Project/Thesis (Final: Dec 22, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE400-01','CSE400','01','Project/Thesis','Dr. Md. Haider Ali','SUN-TUE 08:00 AM-09:20 AM','AB2-703','Dec 22, 2026 9:00 AM-11:00 AM',15,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE400-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE400-02','CSE400','02','Project/Thesis','Dr. Sadia Islam','MON-WED 08:00 AM-09:20 AM','AB2-704','Dec 22, 2026 9:00 AM-11:00 AM',15,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE400-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE400-03','CSE400','03','Project/Thesis','Prof. Mosaddek Hossain','TUE-THU 09:30 AM-10:50 AM','AB2-801','Dec 22, 2026 9:00 AM-11:00 AM',15,15
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE400-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE400-04','CSE400','04','Project/Thesis','Dr. Shazzad Hosain','SUN-TUE 11:00 AM-12:20 PM','AB2-802','Dec 22, 2026 9:00 AM-11:00 AM',15,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE400-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE400-05','CSE400','05','Project/Thesis','Dr. Amitabha Chakrabarty','MON-WED 12:30 PM-01:50 PM','AB2-803','Dec 22, 2026 9:00 AM-11:00 AM',15,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE400-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'CSE400-06','CSE400','06','Project/Thesis','Dr. Md. Faizul Bari','TUE-THU 02:00 PM-03:20 PM','AB2-804','Dec 22, 2026 9:00 AM-11:00 AM',15,6
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'CSE400-06');

-- EEE101 – Electrical Circuits I (Final: Dec 11, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE101-01','EEE101','01','Electrical Circuits I','Dr. Celia Shahnaz','SUN-TUE 08:00 AM-09:20 AM','EEE-101','Dec 11, 2026 9:00 AM-11:00 AM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE101-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE101-02','EEE101','02','Electrical Circuits I','Dr. Celia Shahnaz','MON-WED 08:00 AM-09:20 AM','EEE-102','Dec 11, 2026 9:00 AM-11:00 AM',40,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE101-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE101-03','EEE101','03','Electrical Circuits I','Ms. Farzana Nasrin','TUE-THU 09:30 AM-10:50 AM','EEE-103','Dec 11, 2026 9:00 AM-11:00 AM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE101-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE101-04','EEE101','04','Electrical Circuits I','Ms. Farzana Nasrin','SUN-TUE 11:00 AM-12:20 PM','EEE-201','Dec 11, 2026 9:00 AM-11:00 AM',40,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE101-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE101-05','EEE101','05','Electrical Circuits I','Dr. Celia Shahnaz','MON-WED 12:30 PM-01:50 PM','EEE-202','Dec 11, 2026 9:00 AM-11:00 AM',40,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE101-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE101-06','EEE101','06','Electrical Circuits I','Ms. Farzana Nasrin','TUE-THU 02:00 PM-03:20 PM','EEE-203','Dec 11, 2026 9:00 AM-11:00 AM',40,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE101-06');

-- EEE201 – Electrical Circuits II (Final: Dec 11, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE201-01','EEE201','01','Electrical Circuits II','Dr. Celia Shahnaz','SUN-TUE 09:30 AM-10:50 AM','EEE-301','Dec 11, 2026 2:00 PM-4:00 PM',35,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE201-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE201-02','EEE201','02','Electrical Circuits II','Dr. Celia Shahnaz','MON-WED 09:30 AM-10:50 AM','EEE-302','Dec 11, 2026 2:00 PM-4:00 PM',35,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE201-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE201-03','EEE201','03','Electrical Circuits II','Ms. Farzana Nasrin','TUE-THU 08:00 AM-09:20 AM','EEE-303','Dec 11, 2026 2:00 PM-4:00 PM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE201-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE201-04','EEE201','04','Electrical Circuits II','Ms. Farzana Nasrin','SUN-TUE 11:00 AM-12:20 PM','EEE-401','Dec 11, 2026 2:00 PM-4:00 PM',35,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE201-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE201-05','EEE201','05','Electrical Circuits II','Dr. Celia Shahnaz','MON-WED 02:00 PM-03:20 PM','EEE-402','Dec 11, 2026 2:00 PM-4:00 PM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE201-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE201-06','EEE201','06','Electrical Circuits II','Ms. Farzana Nasrin','TUE-THU 03:30 PM-04:50 PM','EEE-403','Dec 11, 2026 2:00 PM-4:00 PM',35,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE201-06');

-- EEE203 – Electronic Circuits I (Final: Dec 13, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE203-01','EEE203','01','Electronic Circuits I','Dr. Satya Prasad Majumder','SUN-TUE 08:00 AM-09:20 AM','EEE-501','Dec 13, 2026 9:00 AM-11:00 AM',35,33
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE203-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE203-02','EEE203','02','Electronic Circuits I','Dr. Satya Prasad Majumder','MON-WED 08:00 AM-09:20 AM','EEE-502','Dec 13, 2026 9:00 AM-11:00 AM',35,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE203-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE203-03','EEE203','03','Electronic Circuits I','Ms. Farzana Nasrin','TUE-THU 09:30 AM-10:50 AM','EEE-503','Dec 13, 2026 9:00 AM-11:00 AM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE203-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE203-04','EEE203','04','Electronic Circuits I','Ms. Farzana Nasrin','SUN-TUE 12:30 PM-01:50 PM','EEE-601','Dec 13, 2026 9:00 AM-11:00 AM',35,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE203-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE203-05','EEE203','05','Electronic Circuits I','Dr. Satya Prasad Majumder','MON-WED 02:00 PM-03:20 PM','EEE-602','Dec 13, 2026 9:00 AM-11:00 AM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE203-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE203-06','EEE203','06','Electronic Circuits I','Ms. Farzana Nasrin','TUE-THU 03:30 PM-04:50 PM','EEE-603','Dec 13, 2026 9:00 AM-11:00 AM',35,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE203-06');

-- EEE208 – Signals and Systems (Final: Dec 13, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE208-01','EEE208','01','Signals and Systems','Dr. Md. Fokhrul Islam','SUN-TUE 09:30 AM-10:50 AM','EEE-701','Dec 13, 2026 2:00 PM-4:00 PM',35,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE208-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE208-02','EEE208','02','Signals and Systems','Dr. Md. Fokhrul Islam','MON-WED 09:30 AM-10:50 AM','EEE-702','Dec 13, 2026 2:00 PM-4:00 PM',35,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE208-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE208-03','EEE208','03','Signals and Systems','Ms. Farzana Nasrin','TUE-THU 08:00 AM-09:20 AM','EEE-703','Dec 13, 2026 2:00 PM-4:00 PM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE208-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE208-04','EEE208','04','Signals and Systems','Ms. Farzana Nasrin','SUN-TUE 11:00 AM-12:20 PM','EEE-801','Dec 13, 2026 2:00 PM-4:00 PM',35,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE208-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE208-05','EEE208','05','Signals and Systems','Dr. Md. Fokhrul Islam','MON-WED 12:30 PM-01:50 PM','EEE-802','Dec 13, 2026 2:00 PM-4:00 PM',35,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE208-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE208-06','EEE208','06','Signals and Systems','Ms. Farzana Nasrin','TUE-THU 02:00 PM-03:20 PM','EEE-803','Dec 13, 2026 2:00 PM-4:00 PM',35,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE208-06');

-- EEE308 – Electronic Circuits II (Final: Dec 15, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE308-01','EEE308','01','Electronic Circuits II','Dr. Satya Prasad Majumder','SUN-TUE 08:00 AM-09:20 AM','EEE-901','Dec 15, 2026 2:00 PM-4:00 PM',30,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE308-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE308-02','EEE308','02','Electronic Circuits II','Dr. Satya Prasad Majumder','MON-WED 08:00 AM-09:20 AM','EEE-902','Dec 15, 2026 2:00 PM-4:00 PM',30,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE308-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE308-03','EEE308','03','Electronic Circuits II','Ms. Farzana Nasrin','TUE-THU 09:30 AM-10:50 AM','EEB-101','Dec 15, 2026 2:00 PM-4:00 PM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE308-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE308-04','EEE308','04','Electronic Circuits II','Ms. Farzana Nasrin','SUN-TUE 12:30 PM-01:50 PM','EEB-102','Dec 15, 2026 2:00 PM-4:00 PM',30,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE308-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE308-05','EEE308','05','Electronic Circuits II','Dr. Satya Prasad Majumder','MON-WED 02:00 PM-03:20 PM','EEB-103','Dec 15, 2026 2:00 PM-4:00 PM',30,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE308-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE308-06','EEE308','06','Electronic Circuits II','Ms. Farzana Nasrin','TUE-THU 03:30 PM-04:50 PM','EEB-104','Dec 15, 2026 2:00 PM-4:00 PM',30,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE308-06');

-- EEE315 – Microprocessors & Interfacing (Final: Dec 17, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE315-01','EEE315','01','Microprocessors & Interfacing','Dr. Md. Fokhrul Islam','SUN-TUE 08:00 AM-09:20 AM','EEB-201','Dec 17, 2026 2:00 PM-4:00 PM',30,26
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE315-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE315-02','EEE315','02','Microprocessors & Interfacing','Dr. Md. Fokhrul Islam','MON-WED 09:30 AM-10:50 AM','EEB-202','Dec 17, 2026 2:00 PM-4:00 PM',30,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE315-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE315-03','EEE315','03','Microprocessors & Interfacing','Ms. Farzana Nasrin','TUE-THU 08:00 AM-09:20 AM','EEB-203','Dec 17, 2026 2:00 PM-4:00 PM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE315-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE315-04','EEE315','04','Microprocessors & Interfacing','Ms. Farzana Nasrin','SUN-TUE 11:00 AM-12:20 PM','EEB-204','Dec 17, 2026 2:00 PM-4:00 PM',30,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE315-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE315-05','EEE315','05','Microprocessors & Interfacing','Dr. Md. Fokhrul Islam','MON-WED 02:00 PM-03:20 PM','EEB-301','Dec 17, 2026 2:00 PM-4:00 PM',30,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE315-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE315-06','EEE315','06','Microprocessors & Interfacing','Ms. Farzana Nasrin','TUE-THU 02:00 PM-03:20 PM','EEB-302','Dec 17, 2026 2:00 PM-4:00 PM',30,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE315-06');

-- EEE321 – Digital Signal Processing (Final: Dec 20, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE321-01','EEE321','01','Digital Signal Processing','Dr. Celia Shahnaz','SUN-TUE 09:30 AM-10:50 AM','EEB-303','Dec 20, 2026 9:00 AM-11:00 AM',25,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE321-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE321-02','EEE321','02','Digital Signal Processing','Dr. Celia Shahnaz','MON-WED 08:00 AM-09:20 AM','EEB-304','Dec 20, 2026 9:00 AM-11:00 AM',25,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE321-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE321-03','EEE321','03','Digital Signal Processing','Dr. Md. Fokhrul Islam','TUE-THU 08:00 AM-09:20 AM','EEB-401','Dec 20, 2026 9:00 AM-11:00 AM',25,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE321-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE321-04','EEE321','04','Digital Signal Processing','Dr. Md. Fokhrul Islam','SUN-TUE 12:30 PM-01:50 PM','EEB-402','Dec 20, 2026 9:00 AM-11:00 AM',25,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE321-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE321-05','EEE321','05','Digital Signal Processing','Dr. Celia Shahnaz','MON-WED 02:00 PM-03:20 PM','EEB-403','Dec 20, 2026 9:00 AM-11:00 AM',25,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE321-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE321-06','EEE321','06','Digital Signal Processing','Dr. Md. Fokhrul Islam','TUE-THU 03:30 PM-04:50 PM','EEB-404','Dec 20, 2026 9:00 AM-11:00 AM',25,6
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE321-06');

-- EEE401 – Power System Analysis (Final: Dec 21, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE401-01','EEE401','01','Power System Analysis','Dr. Mohammad Ali','SUN-TUE 08:00 AM-09:20 AM','EEB-501','Dec 21, 2026 2:00 PM-4:00 PM',25,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE401-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE401-02','EEE401','02','Power System Analysis','Dr. Mohammad Ali','MON-WED 09:30 AM-10:50 AM','EEB-502','Dec 21, 2026 2:00 PM-4:00 PM',25,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE401-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE401-03','EEE401','03','Power System Analysis','Dr. Satya Prasad Majumder','TUE-THU 09:30 AM-10:50 AM','EEB-503','Dec 21, 2026 2:00 PM-4:00 PM',25,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE401-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE401-04','EEE401','04','Power System Analysis','Dr. Satya Prasad Majumder','SUN-TUE 11:00 AM-12:20 PM','EEB-601','Dec 21, 2026 2:00 PM-4:00 PM',25,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE401-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE401-05','EEE401','05','Power System Analysis','Dr. Mohammad Ali','MON-WED 12:30 PM-01:50 PM','EEB-602','Dec 21, 2026 2:00 PM-4:00 PM',25,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE401-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE401-06','EEE401','06','Power System Analysis','Dr. Satya Prasad Majumder','TUE-THU 02:00 PM-03:20 PM','EEB-603','Dec 21, 2026 2:00 PM-4:00 PM',25,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE401-06');

-- EEE411 – Renewable Energy Systems (Final: Dec 22, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE411-01','EEE411','01','Renewable Energy Systems','Dr. Saifur Rahman','SUN-TUE 09:30 AM-10:50 AM','EEB-701','Dec 22, 2026 2:00 PM-4:00 PM',25,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE411-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE411-02','EEE411','02','Renewable Energy Systems','Dr. Saifur Rahman','MON-WED 08:00 AM-09:20 AM','EEB-702','Dec 22, 2026 2:00 PM-4:00 PM',25,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE411-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE411-03','EEE411','03','Renewable Energy Systems','Dr. Mohammad Ali','TUE-THU 08:00 AM-09:20 AM','EEB-703','Dec 22, 2026 2:00 PM-4:00 PM',25,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE411-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE411-04','EEE411','04','Renewable Energy Systems','Dr. Mohammad Ali','SUN-TUE 12:30 PM-01:50 PM','EEB-801','Dec 22, 2026 2:00 PM-4:00 PM',25,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE411-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE411-05','EEE411','05','Renewable Energy Systems','Dr. Saifur Rahman','MON-WED 02:00 PM-03:20 PM','EEB-802','Dec 22, 2026 2:00 PM-4:00 PM',25,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE411-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE411-06','EEE411','06','Renewable Energy Systems','Dr. Mohammad Ali','TUE-THU 03:30 PM-04:50 PM','EEB-803','Dec 22, 2026 2:00 PM-4:00 PM',25,6
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE411-06');

-- EEE450 – Communication Systems (Final: Dec 23, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE450-01','EEE450','01','Communication Systems','Dr. Md. Fokhrul Islam','SUN-TUE 08:00 AM-09:20 AM','EEB-901','Dec 23, 2026 9:00 AM-11:00 AM',30,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE450-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE450-02','EEE450','02','Communication Systems','Dr. Md. Fokhrul Islam','MON-WED 09:30 AM-10:50 AM','EEB-902','Dec 23, 2026 9:00 AM-11:00 AM',30,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE450-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE450-03','EEE450','03','Communication Systems','Dr. Celia Shahnaz','TUE-THU 09:30 AM-10:50 AM','EEB-903','Dec 23, 2026 9:00 AM-11:00 AM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE450-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE450-04','EEE450','04','Communication Systems','Dr. Celia Shahnaz','SUN-TUE 11:00 AM-12:20 PM','EEC-101','Dec 23, 2026 9:00 AM-11:00 AM',30,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE450-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE450-05','EEE450','05','Communication Systems','Dr. Md. Fokhrul Islam','MON-WED 02:00 PM-03:20 PM','EEC-102','Dec 23, 2026 9:00 AM-11:00 AM',30,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE450-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'EEE450-06','EEE450','06','Communication Systems','Dr. Celia Shahnaz','TUE-THU 02:00 PM-03:20 PM','EEC-103','Dec 23, 2026 9:00 AM-11:00 AM',30,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'EEE450-06');

-- BUS101 – Introduction to Business (Final: Dec 10, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'BUS101-01','BUS101','01','Introduction to Business','Dr. Syed Akhter Hossain','SUN-TUE 08:00 AM-09:20 AM','BBA-101','Dec 10, 2026 9:00 AM-11:00 AM',50,48
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'BUS101-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'BUS101-02','BUS101','02','Introduction to Business','Dr. Syed Akhter Hossain','MON-WED 08:00 AM-09:20 AM','BBA-102','Dec 10, 2026 9:00 AM-11:00 AM',50,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'BUS101-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'BUS101-03','BUS101','03','Introduction to Business','Ms. Tasneem Ali','TUE-THU 09:30 AM-10:50 AM','BBA-103','Dec 10, 2026 9:00 AM-11:00 AM',50,50
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'BUS101-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'BUS101-04','BUS101','04','Introduction to Business','Ms. Tasneem Ali','SUN-TUE 11:00 AM-12:20 PM','BBA-201','Dec 10, 2026 9:00 AM-11:00 AM',50,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'BUS101-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'BUS101-05','BUS101','05','Introduction to Business','Dr. Syed Akhter Hossain','MON-WED 12:30 PM-01:50 PM','BBA-202','Dec 10, 2026 9:00 AM-11:00 AM',50,42
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'BUS101-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'BUS101-06','BUS101','06','Introduction to Business','Ms. Tasneem Ali','TUE-THU 02:00 PM-03:20 PM','BBA-203','Dec 10, 2026 9:00 AM-11:00 AM',50,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'BUS101-06');

-- ECO101 – Microeconomics (Final: Dec 10, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO101-01','ECO101','01','Microeconomics','Dr. Nazneen Ahmed','SUN-TUE 09:30 AM-10:50 AM','BBA-301','Dec 10, 2026 2:00 PM-4:00 PM',45,42
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO101-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO101-02','ECO101','02','Microeconomics','Dr. Nazneen Ahmed','MON-WED 09:30 AM-10:50 AM','BBA-302','Dec 10, 2026 2:00 PM-4:00 PM',45,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO101-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO101-03','ECO101','03','Microeconomics','Ms. Tasneem Ali','TUE-THU 08:00 AM-09:20 AM','BBA-303','Dec 10, 2026 2:00 PM-4:00 PM',45,45
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO101-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO101-04','ECO101','04','Microeconomics','Ms. Tasneem Ali','SUN-TUE 12:30 PM-01:50 PM','BBA-401','Dec 10, 2026 2:00 PM-4:00 PM',45,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO101-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO101-05','ECO101','05','Microeconomics','Dr. Nazneen Ahmed','MON-WED 02:00 PM-03:20 PM','BBA-402','Dec 10, 2026 2:00 PM-4:00 PM',45,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO101-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO101-06','ECO101','06','Microeconomics','Ms. Tasneem Ali','TUE-THU 03:30 PM-04:50 PM','BBA-403','Dec 10, 2026 2:00 PM-4:00 PM',45,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO101-06');

-- ECO102 – Macroeconomics (Final: Dec 12, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO102-01','ECO102','01','Macroeconomics','Dr. Nazneen Ahmed','SUN-TUE 08:00 AM-09:20 AM','BBA-501','Dec 12, 2026 9:00 AM-11:00 AM',45,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO102-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO102-02','ECO102','02','Macroeconomics','Dr. Nazneen Ahmed','MON-WED 08:00 AM-09:20 AM','BBA-502','Dec 12, 2026 9:00 AM-11:00 AM',45,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO102-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO102-03','ECO102','03','Macroeconomics','Ms. Tasneem Ali','TUE-THU 09:30 AM-10:50 AM','BBA-503','Dec 12, 2026 9:00 AM-11:00 AM',45,45
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO102-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO102-04','ECO102','04','Macroeconomics','Ms. Tasneem Ali','SUN-TUE 11:00 AM-12:20 PM','BBA-601','Dec 12, 2026 9:00 AM-11:00 AM',45,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO102-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO102-05','ECO102','05','Macroeconomics','Dr. Nazneen Ahmed','MON-WED 12:30 PM-01:50 PM','BBA-602','Dec 12, 2026 9:00 AM-11:00 AM',45,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO102-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ECO102-06','ECO102','06','Macroeconomics','Ms. Tasneem Ali','TUE-THU 02:00 PM-03:20 PM','BBA-603','Dec 12, 2026 9:00 AM-11:00 AM',45,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ECO102-06');

-- ACC101 – Financial Accounting (Final: Dec 12, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ACC101-01','ACC101','01','Financial Accounting','Dr. Mahbub Ahmed','SUN-TUE 09:30 AM-10:50 AM','BBA-701','Dec 12, 2026 2:00 PM-4:00 PM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ACC101-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ACC101-02','ACC101','02','Financial Accounting','Dr. Mahbub Ahmed','MON-WED 09:30 AM-10:50 AM','BBA-702','Dec 12, 2026 2:00 PM-4:00 PM',40,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ACC101-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ACC101-03','ACC101','03','Financial Accounting','Ms. Tasneem Ali','TUE-THU 08:00 AM-09:20 AM','BBA-703','Dec 12, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ACC101-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ACC101-04','ACC101','04','Financial Accounting','Ms. Tasneem Ali','SUN-TUE 12:30 PM-01:50 PM','BBA-801','Dec 12, 2026 2:00 PM-4:00 PM',40,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ACC101-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ACC101-05','ACC101','05','Financial Accounting','Dr. Mahbub Ahmed','MON-WED 02:00 PM-03:20 PM','BBA-802','Dec 12, 2026 2:00 PM-4:00 PM',40,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ACC101-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ACC101-06','ACC101','06','Financial Accounting','Ms. Tasneem Ali','TUE-THU 03:30 PM-04:50 PM','BBA-803','Dec 12, 2026 2:00 PM-4:00 PM',40,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ACC101-06');

-- MGT201 – Principles of Management (Final: Dec 14, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT201-01','MGT201','01','Principles of Management','Dr. Syed Akhter Hossain','SUN-TUE 08:00 AM-09:20 AM','BBA-901','Dec 14, 2026 2:00 PM-4:00 PM',40,36
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT201-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT201-02','MGT201','02','Principles of Management','Dr. Syed Akhter Hossain','MON-WED 08:00 AM-09:20 AM','BBA-902','Dec 14, 2026 2:00 PM-4:00 PM',40,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT201-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT201-03','MGT201','03','Principles of Management','Ms. Tasneem Ali','TUE-THU 09:30 AM-10:50 AM','BBB-101','Dec 14, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT201-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT201-04','MGT201','04','Principles of Management','Ms. Tasneem Ali','SUN-TUE 11:00 AM-12:20 PM','BBB-102','Dec 14, 2026 2:00 PM-4:00 PM',40,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT201-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT201-05','MGT201','05','Principles of Management','Dr. Syed Akhter Hossain','MON-WED 12:30 PM-01:50 PM','BBB-103','Dec 14, 2026 2:00 PM-4:00 PM',40,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT201-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT201-06','MGT201','06','Principles of Management','Ms. Tasneem Ali','TUE-THU 02:00 PM-03:20 PM','BBB-104','Dec 14, 2026 2:00 PM-4:00 PM',40,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT201-06');

-- MKT301 – Marketing Management (Final: Dec 16, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT301-01','MKT301','01','Marketing Management','Dr. Mujib Rahman','SUN-TUE 09:30 AM-10:50 AM','BBB-201','Dec 16, 2026 9:00 AM-11:00 AM',35,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT301-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT301-02','MKT301','02','Marketing Management','Dr. Mujib Rahman','MON-WED 09:30 AM-10:50 AM','BBB-202','Dec 16, 2026 9:00 AM-11:00 AM',35,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT301-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT301-03','MKT301','03','Marketing Management','Ms. Tasneem Ali','TUE-THU 08:00 AM-09:20 AM','BBB-203','Dec 16, 2026 9:00 AM-11:00 AM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT301-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT301-04','MKT301','04','Marketing Management','Ms. Tasneem Ali','SUN-TUE 12:30 PM-01:50 PM','BBB-301','Dec 16, 2026 9:00 AM-11:00 AM',35,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT301-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT301-05','MKT301','05','Marketing Management','Dr. Mujib Rahman','MON-WED 02:00 PM-03:20 PM','BBB-302','Dec 16, 2026 9:00 AM-11:00 AM',35,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT301-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT301-06','MKT301','06','Marketing Management','Ms. Tasneem Ali','TUE-THU 03:30 PM-04:50 PM','BBB-303','Dec 16, 2026 9:00 AM-11:00 AM',35,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT301-06');

-- FIN301 – Financial Management (Final: Dec 16, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN301-01','FIN301','01','Financial Management','Dr. Mahbub Ahmed','SUN-TUE 08:00 AM-09:20 AM','BBB-401','Dec 16, 2026 2:00 PM-4:00 PM',35,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN301-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN301-02','FIN301','02','Financial Management','Dr. Mahbub Ahmed','MON-WED 08:00 AM-09:20 AM','BBB-402','Dec 16, 2026 2:00 PM-4:00 PM',35,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN301-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN301-03','FIN301','03','Financial Management','Ms. Tasneem Ali','TUE-THU 09:30 AM-10:50 AM','BBB-403','Dec 16, 2026 2:00 PM-4:00 PM',35,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN301-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN301-04','FIN301','04','Financial Management','Ms. Tasneem Ali','SUN-TUE 12:30 PM-01:50 PM','BBB-501','Dec 16, 2026 2:00 PM-4:00 PM',35,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN301-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN301-05','FIN301','05','Financial Management','Dr. Mahbub Ahmed','MON-WED 12:30 PM-01:50 PM','BBB-502','Dec 16, 2026 2:00 PM-4:00 PM',35,26
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN301-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN301-06','FIN301','06','Financial Management','Ms. Tasneem Ali','TUE-THU 02:00 PM-03:20 PM','BBB-503','Dec 16, 2026 2:00 PM-4:00 PM',35,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN301-06');

-- MGT401 – Strategic Management (Final: Dec 18, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT401-01','MGT401','01','Strategic Management','Dr. Syed Akhter Hossain','SUN-TUE 09:30 AM-10:50 AM','BBB-601','Dec 18, 2026 2:00 PM-4:00 PM',30,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT401-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT401-02','MGT401','02','Strategic Management','Dr. Syed Akhter Hossain','MON-WED 09:30 AM-10:50 AM','BBB-602','Dec 18, 2026 2:00 PM-4:00 PM',30,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT401-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT401-03','MGT401','03','Strategic Management','Ms. Tasneem Ali','TUE-THU 08:00 AM-09:20 AM','BBB-603','Dec 18, 2026 2:00 PM-4:00 PM',30,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT401-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT401-04','MGT401','04','Strategic Management','Ms. Tasneem Ali','SUN-TUE 11:00 AM-12:20 PM','BBB-701','Dec 18, 2026 2:00 PM-4:00 PM',30,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT401-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT401-05','MGT401','05','Strategic Management','Dr. Syed Akhter Hossain','MON-WED 02:00 PM-03:20 PM','BBB-702','Dec 18, 2026 2:00 PM-4:00 PM',30,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT401-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MGT401-06','MGT401','06','Strategic Management','Ms. Tasneem Ali','TUE-THU 02:00 PM-03:20 PM','BBB-703','Dec 18, 2026 2:00 PM-4:00 PM',30,8
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MGT401-06');

-- FIN401 – Investment Analysis (Final: Dec 19, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN401-01','FIN401','01','Investment Analysis','Dr. Mahbub Ahmed','SUN-TUE 08:00 AM-09:20 AM','BBB-801','Dec 19, 2026 9:00 AM-11:00 AM',25,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN401-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN401-02','FIN401','02','Investment Analysis','Dr. Mahbub Ahmed','MON-WED 08:00 AM-09:20 AM','BBB-802','Dec 19, 2026 9:00 AM-11:00 AM',25,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN401-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN401-03','FIN401','03','Investment Analysis','Ms. Tasneem Ali','TUE-THU 09:30 AM-10:50 AM','BBB-803','Dec 19, 2026 9:00 AM-11:00 AM',25,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN401-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN401-04','FIN401','04','Investment Analysis','Ms. Tasneem Ali','SUN-TUE 12:30 PM-01:50 PM','BBB-901','Dec 19, 2026 9:00 AM-11:00 AM',25,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN401-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN401-05','FIN401','05','Investment Analysis','Dr. Mahbub Ahmed','MON-WED 12:30 PM-01:50 PM','BBB-902','Dec 19, 2026 9:00 AM-11:00 AM',25,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN401-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'FIN401-06','FIN401','06','Investment Analysis','Ms. Tasneem Ali','TUE-THU 02:00 PM-03:20 PM','BBB-903','Dec 19, 2026 9:00 AM-11:00 AM',25,6
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'FIN401-06');

-- MKT402 – Digital Marketing & E-Commerce (Final: Dec 20, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT402-01','MKT402','01','Digital Marketing & E-Commerce','Dr. Mujib Rahman','SUN-TUE 09:30 AM-10:50 AM','BBC-101','Dec 20, 2026 9:00 AM-11:00 AM',25,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT402-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT402-02','MKT402','02','Digital Marketing & E-Commerce','Dr. Mujib Rahman','MON-WED 09:30 AM-10:50 AM','BBC-102','Dec 20, 2026 9:00 AM-11:00 AM',25,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT402-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT402-03','MKT402','03','Digital Marketing & E-Commerce','Ms. Tasneem Ali','TUE-THU 08:00 AM-09:20 AM','BBC-103','Dec 20, 2026 9:00 AM-11:00 AM',25,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT402-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT402-04','MKT402','04','Digital Marketing & E-Commerce','Ms. Tasneem Ali','SUN-TUE 11:00 AM-12:20 PM','BBC-201','Dec 20, 2026 9:00 AM-11:00 AM',25,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT402-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT402-05','MKT402','05','Digital Marketing & E-Commerce','Dr. Mujib Rahman','MON-WED 02:00 PM-03:20 PM','BBC-202','Dec 20, 2026 9:00 AM-11:00 AM',25,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT402-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MKT402-06','MKT402','06','Digital Marketing & E-Commerce','Ms. Tasneem Ali','TUE-THU 03:30 PM-04:50 PM','BBC-203','Dec 20, 2026 9:00 AM-11:00 AM',25,6
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MKT402-06');

-- ENG102 – English & Communication Skills II (Final: Dec 24, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG102-01','ENG102','01','English & Communication Skills II','Dr. Niaz Zaman','SUN-TUE 08:00 AM-09:20 AM','GED-101','Dec 24, 2026 9:00 AM-11:00 AM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG102-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG102-02','ENG102','02','English & Communication Skills II','Dr. Niaz Zaman','MON-WED 08:00 AM-09:20 AM','GED-102','Dec 24, 2026 9:00 AM-11:00 AM',40,28
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG102-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG102-03','ENG102','03','Ms. Farhana Akter','Ms. Farhana Akter','TUE-THU 09:30 AM-10:50 AM','GED-103','Dec 24, 2026 9:00 AM-11:00 AM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG102-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG102-04','ENG102','04','English & Communication Skills II','Ms. Farhana Akter','SUN-TUE 11:00 AM-12:20 PM','GED-201','Dec 24, 2026 9:00 AM-11:00 AM',40,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG102-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG102-05','ENG102','05','English & Communication Skills II','Dr. Niaz Zaman','MON-WED 12:30 PM-01:50 PM','GED-202','Dec 24, 2026 9:00 AM-11:00 AM',40,35
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG102-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'ENG102-06','ENG102','06','English & Communication Skills II','Ms. Farhana Akter','TUE-THU 02:00 PM-03:20 PM','GED-203','Dec 24, 2026 9:00 AM-11:00 AM',40,15
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'ENG102-06');

-- MAT120 – Mathematics II (Final: Dec 22, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT120-01','MAT120','01','Mathematics II','Dr. M. A. Rashid','SUN-TUE 08:00 AM-09:20 AM','GED-301','Dec 22, 2026 2:00 PM-4:00 PM',45,42
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT120-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT120-02','MAT120','02','Mathematics II','Dr. M. A. Rashid','MON-WED 08:00 AM-09:20 AM','GED-302','Dec 22, 2026 2:00 PM-4:00 PM',45,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT120-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT120-03','MAT120','03','Mathematics II','Ms. Sharmin Sultana','TUE-THU 09:30 AM-10:50 AM','GED-303','Dec 22, 2026 2:00 PM-4:00 PM',45,45
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT120-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT120-04','MAT120','04','Mathematics II','Ms. Sharmin Sultana','SUN-TUE 11:00 AM-12:20 PM','GED-401','Dec 22, 2026 2:00 PM-4:00 PM',45,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT120-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT120-05','MAT120','05','Mathematics II','Dr. M. A. Rashid','MON-WED 02:00 PM-03:20 PM','GED-402','Dec 22, 2026 2:00 PM-4:00 PM',45,36
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT120-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT120-06','MAT120','06','Mathematics II','Ms. Sharmin Sultana','TUE-THU 03:30 PM-04:50 PM','GED-403','Dec 22, 2026 2:00 PM-4:00 PM',45,14
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT120-06');

-- MAT215 – Mathematics III / Linear Algebra (Final: Dec 23, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT215-01','MAT215','01','Mathematics III (Linear Algebra)','Dr. Satya Ranjan Chakrabarty','SUN-TUE 09:30 AM-10:50 AM','GED-501','Dec 23, 2026 9:00 AM-11:00 AM',40,36
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT215-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT215-02','MAT215','02','Mathematics III (Linear Algebra)','Dr. Satya Ranjan Chakrabarty','MON-WED 09:30 AM-10:50 AM','GED-502','Dec 23, 2026 9:00 AM-11:00 AM',40,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT215-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT215-03','MAT215','03','Mathematics III (Linear Algebra)','Ms. Sharmin Sultana','TUE-THU 08:00 AM-09:20 AM','GED-503','Dec 23, 2026 9:00 AM-11:00 AM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT215-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT215-04','MAT215','04','Mathematics III (Linear Algebra)','Ms. Sharmin Sultana','SUN-TUE 12:30 PM-01:50 PM','GED-601','Dec 23, 2026 9:00 AM-11:00 AM',40,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT215-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT215-05','MAT215','05','Mathematics III (Linear Algebra)','Dr. Satya Ranjan Chakrabarty','MON-WED 02:00 PM-03:20 PM','GED-602','Dec 23, 2026 9:00 AM-11:00 AM',40,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT215-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT215-06','MAT215','06','Mathematics III (Linear Algebra)','Ms. Sharmin Sultana','TUE-THU 03:30 PM-04:50 PM','GED-603','Dec 23, 2026 9:00 AM-11:00 AM',40,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT215-06');

-- MAT216 – Mathematics IV / Statistics (Final: Dec 23, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT216-01','MAT216','01','Mathematics IV (Statistics)','Dr. Satya Ranjan Chakrabarty','SUN-TUE 08:00 AM-09:20 AM','GED-701','Dec 23, 2026 2:00 PM-4:00 PM',40,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT216-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT216-02','MAT216','02','Mathematics IV (Statistics)','Dr. Satya Ranjan Chakrabarty','MON-WED 08:00 AM-09:20 AM','GED-702','Dec 23, 2026 2:00 PM-4:00 PM',40,25
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT216-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT216-03','MAT216','03','Mathematics IV (Statistics)','Ms. Sharmin Sultana','TUE-THU 09:30 AM-10:50 AM','GED-703','Dec 23, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT216-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT216-04','MAT216','04','Mathematics IV (Statistics)','Ms. Sharmin Sultana','SUN-TUE 11:00 AM-12:20 PM','GED-801','Dec 23, 2026 2:00 PM-4:00 PM',40,20
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT216-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT216-05','MAT216','05','Mathematics IV (Statistics)','Dr. Satya Ranjan Chakrabarty','MON-WED 12:30 PM-01:50 PM','GED-802','Dec 23, 2026 2:00 PM-4:00 PM',40,32
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT216-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'MAT216-06','MAT216','06','Mathematics IV (Statistics)','Ms. Sharmin Sultana','TUE-THU 02:00 PM-03:20 PM','GED-803','Dec 23, 2026 2:00 PM-4:00 PM',40,12
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'MAT216-06');

-- PHY111 – Physics I / Mechanics (Final: Dec 11, 9:00 AM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY111-01','PHY111','01','Physics I (Mechanics)','Dr. Zahirul Islam','SUN-TUE 08:00 AM-09:20 AM','GED-901','Dec 11, 2026 9:00 AM-11:00 AM',45,42
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY111-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY111-02','PHY111','02','Physics I (Mechanics)','Dr. Zahirul Islam','MON-WED 08:00 AM-09:20 AM','GED-902','Dec 11, 2026 9:00 AM-11:00 AM',45,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY111-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY111-03','PHY111','03','Physics I (Mechanics)','Mr. Iftekhar Uddin','TUE-THU 09:30 AM-10:50 AM','GEE-101','Dec 11, 2026 9:00 AM-11:00 AM',45,45
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY111-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY111-04','PHY111','04','Physics I (Mechanics)','Mr. Iftekhar Uddin','SUN-TUE 11:00 AM-12:20 PM','GEE-102','Dec 11, 2026 9:00 AM-11:00 AM',45,22
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY111-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY111-05','PHY111','05','Physics I (Mechanics)','Dr. Zahirul Islam','MON-WED 12:30 PM-01:50 PM','GEE-103','Dec 11, 2026 9:00 AM-11:00 AM',45,38
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY111-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY111-06','PHY111','06','Physics I (Mechanics)','Mr. Iftekhar Uddin','TUE-THU 02:00 PM-03:20 PM','GEE-201','Dec 11, 2026 9:00 AM-11:00 AM',45,16
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY111-06');

-- PHY112 – Physics II / Electromagnetism (Final: Dec 11, 2:00 PM)
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY112-01','PHY112','01','Physics II (Electromagnetism)','Dr. Zahirul Islam','SUN-TUE 09:30 AM-10:50 AM','GEE-202','Dec 11, 2026 2:00 PM-4:00 PM',40,36
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY112-01');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY112-02','PHY112','02','Physics II (Electromagnetism)','Dr. Zahirul Islam','MON-WED 09:30 AM-10:50 AM','GEE-203','Dec 11, 2026 2:00 PM-4:00 PM',40,24
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY112-02');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY112-03','PHY112','03','Physics II (Electromagnetism)','Mr. Iftekhar Uddin','TUE-THU 08:00 AM-09:20 AM','GEE-301','Dec 11, 2026 2:00 PM-4:00 PM',40,40
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY112-03');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY112-04','PHY112','04','Physics II (Electromagnetism)','Mr. Iftekhar Uddin','SUN-TUE 12:30 PM-01:50 PM','GEE-302','Dec 11, 2026 2:00 PM-4:00 PM',40,18
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY112-04');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY112-05','PHY112','05','Physics II (Electromagnetism)','Dr. Zahirul Islam','MON-WED 02:00 PM-03:20 PM','GEE-303','Dec 11, 2026 2:00 PM-4:00 PM',40,30
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY112-05');
INSERT INTO course_section (id, code, section, title, faculty, time, room, exam_day, total_seats, booked)
SELECT 'PHY112-06','PHY112','06','Physics II (Electromagnetism)','Mr. Iftekhar Uddin','TUE-THU 03:30 PM-04:50 PM','GEE-401','Dec 11, 2026 2:00 PM-4:00 PM',40,10
WHERE NOT EXISTS (SELECT 1 FROM course_section WHERE id = 'PHY112-06');


-- ============================================================

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Dr. Sarah Ahmed','Associate Professor & Academic Advisor','cse','Computer Science & Engineering','9:00 AM - 3:00 PM','s.ahmed@campusconnect.edu','Dr. Ahmed has 10+ years of experience advising CSE students on course selection, research opportunities, and career pathways in software and AI.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 's.ahmed@campusconnect.edu');

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Prof. Tariq Hassan','Senior Lecturer & Academic Advisor','cse','Computer Science & Engineering','10:00 AM - 4:00 PM','t.hassan@campusconnect.edu','Prof. Hassan specializes in guiding students through advanced CSE coursework and graduate admissions.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 't.hassan@campusconnect.edu');

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Dr. Ayan Das','Associate Professor & Academic Advisor','eee','Electrical & Electronic Engineering','11:00 AM - 5:00 PM','a.das@campusconnect.edu','Dr. Das advises EEE students on lab-intensive courses and industry placements.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 'a.das@campusconnect.edu');

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Dr. Meena Akter','Professor & Academic Advisor','bba','Business Administration','10:00 AM - 2:00 PM','m.akter@campusconnect.edu','Dr. Akter guides BBA students in selecting electives aligned with their career goals.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 'm.akter@campusconnect.edu');

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Prof. Dina Alam','Head of Academic Affairs','arch','Architecture & Planning','9:00 AM - 1:00 PM','d.alam@campusconnect.edu','Prof. Alam helps Architecture students balance studio workloads and build portfolios.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 'd.alam@campusconnect.edu');

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Dr. Karim Hossain','Academic Advisor & Research Mentor','math','Mathematics & Physics','8:00 AM - 12:00 PM','k.hossain@campusconnect.edu','Dr. Hossain advises Math & Physics students on research projects and graduate admissions.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 'k.hossain@campusconnect.edu');

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Prof. Jabir Khan','Academic Advisor','eco','Economics','1:00 PM - 5:00 PM','j.khan@campusconnect.edu','Prof. Khan guides Economics students in research and career preparation.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 'j.khan@campusconnect.edu');

INSERT INTO advisors (name, title, department, department_label, available_hours, email, bio)
SELECT 'Dr. Sonia Rahman','Academic Advisor & Career Counsellor','eng','English & Literature','11:00 AM - 3:00 PM','s.rahman@campusconnect.edu','Dr. Rahman supports English students with course planning and career paths.'
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE email = 's.rahman@campusconnect.edu');

-- Advisor specialties
INSERT INTO advisor_specialties (advisor_id, specialty)
SELECT a.id, v.spec FROM advisors a
JOIN (VALUES ('Software Engineering'),('Machine Learning'),('Career Planning')) AS v(spec) ON true
WHERE a.email = 's.ahmed@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_specialties WHERE advisor_id = a.id);

INSERT INTO advisor_specialties (advisor_id, specialty)
SELECT a.id, v.spec FROM advisors a
JOIN (VALUES ('Data Structures'),('Competitive Programming'),('Graduate School')) AS v(spec) ON true
WHERE a.email = 't.hassan@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_specialties WHERE advisor_id = a.id);

INSERT INTO advisor_specialties (advisor_id, specialty)
SELECT a.id, v.spec FROM advisors a
JOIN (VALUES ('Circuit Design'),('Embedded Systems'),('Power Electronics')) AS v(spec) ON true
WHERE a.email = 'a.das@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_specialties WHERE advisor_id = a.id);

INSERT INTO advisor_specialties (advisor_id, specialty)
SELECT a.id, v.spec FROM advisors a
JOIN (VALUES ('Marketing'),('Entrepreneurship'),('International Business')) AS v(spec) ON true
WHERE a.email = 'm.akter@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_specialties WHERE advisor_id = a.id);

INSERT INTO advisor_specialties (advisor_id, specialty)
SELECT a.id, v.spec FROM advisors a
JOIN (VALUES ('Applied Mathematics'),('Research Methods'),('Graduate Admissions')) AS v(spec) ON true
WHERE a.email = 'k.hossain@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_specialties WHERE advisor_id = a.id);

-- Advisor available days
INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Monday'),('Wednesday'),('Friday')) AS v(d) ON true
WHERE a.email = 's.ahmed@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Tuesday'),('Thursday')) AS v(d) ON true
WHERE a.email = 't.hassan@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Monday'),('Tuesday'),('Thursday')) AS v(d) ON true
WHERE a.email = 'a.das@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Monday'),('Wednesday'),('Friday')) AS v(d) ON true
WHERE a.email = 'm.akter@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Monday'),('Wednesday'),('Thursday'),('Friday')) AS v(d) ON true
WHERE a.email = 'k.hossain@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Tuesday'),('Thursday'),('Saturday')) AS v(d) ON true
WHERE a.email = 'd.alam@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Monday'),('Tuesday'),('Friday')) AS v(d) ON true
WHERE a.email = 'j.khan@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

INSERT INTO advisor_available_days (advisor_id, day_name)
SELECT a.id, v.d FROM advisors a
JOIN (VALUES ('Wednesday'),('Thursday'),('Friday')) AS v(d) ON true
WHERE a.email = 's.rahman@campusconnect.edu'
  AND NOT EXISTS (SELECT 1 FROM advisor_available_days WHERE advisor_id = a.id);

-- ============================================================
-- Student Profiles (Phase 3 – Neon PostgreSQL)
-- completedCourses: CSV of codes the student has already passed
-- ============================================================

INSERT INTO student_profiles (student_id, student_name, email, department, year, cgpa, completed_credits, on_probation, completed_courses)
SELECT 'STU001','Eusha Kayenat','eusha@campusconnect.edu','Computer Science & Engineering',2,3.45,48,false,'CSE110,CSE111,MAT110,ENG101,PHY101,CSE220,CSE260'
WHERE NOT EXISTS (SELECT 1 FROM student_profiles WHERE student_id = 'STU001');

INSERT INTO student_profiles (student_id, student_name, email, department, year, cgpa, completed_credits, on_probation, completed_courses)
SELECT 'STU002','Arham Hossain','arham@campusconnect.edu','Computer Science & Engineering',3,1.85,90,true,'CSE110,CSE111,MAT110,ENG101,PHY101,CSE220,CSE260,CSE321,CSE330,CSE331,CSE340,CSE370,EEE101'
WHERE NOT EXISTS (SELECT 1 FROM student_profiles WHERE student_id = 'STU002');

INSERT INTO student_profiles (student_id, student_name, email, department, year, cgpa, completed_credits, on_probation, completed_courses)
SELECT 'STU003','Nafiz Rahman','nafiz@campusconnect.edu','Electrical & Electronic Engineering',2,3.72,54,false,'EEE101,MAT110,ENG101,PHY101,EEE201,EEE203'
WHERE NOT EXISTS (SELECT 1 FROM student_profiles WHERE student_id = 'STU003');

INSERT INTO student_profiles (student_id, student_name, email, department, year, cgpa, completed_credits, on_probation, completed_courses)
SELECT 'STU004','Sadia Islam','sadia@campusconnect.edu','Business Administration',1,2.10,18,false,'BUS101,ENG101,MAT110'
WHERE NOT EXISTS (SELECT 1 FROM student_profiles WHERE student_id = 'STU004');

-- ============================================================
-- Prerequisite codes for CourseSection rows
-- Applied safely: only updates rows where prereq is not yet set
-- ============================================================

UPDATE course_section SET prerequisite_codes = 'CSE110'     WHERE code = 'CSE111' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE111'     WHERE code = 'CSE220' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE220'     WHERE code = 'CSE221' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE111'     WHERE code = 'CSE260' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE220,CSE260' WHERE code = 'CSE321' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE220'     WHERE code = 'CSE330' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE221'     WHERE code = 'CSE331' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE260'     WHERE code = 'CSE340' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE220'     WHERE code = 'CSE370' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE221,CSE321' WHERE code = 'CSE420' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE321'     WHERE code = 'CSE421' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE221'     WHERE code = 'CSE422' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'CSE370'     WHERE code = 'CSE470' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'EEE101'     WHERE code = 'EEE201' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'EEE101'     WHERE code = 'EEE203' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'EEE203'     WHERE code = 'EEE308' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');
UPDATE course_section SET prerequisite_codes = 'EEE208'     WHERE code = 'EEE321' AND (prerequisite_codes IS NULL OR prerequisite_codes = '');

