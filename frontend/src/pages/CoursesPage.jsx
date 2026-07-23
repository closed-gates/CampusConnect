import { useState, useMemo } from "react"
import Sidebar from "../components/Sidebar"

/* -- Proxy Data ------------------------------------------- */
const FACULTIES = [
  { id: "cse",  label: "Computer Science & Engineering", icon: "💻", color: "#E8F4FD", accent: "#2563EB" },
  { id: "eee",  label: "Electrical & Electronic Eng.",   icon: "⚡", color: "#FFF7ED", accent: "#EA580C" },
  { id: "bba",  label: "Business Administration",        icon: "📊", color: "#F0FDF4", accent: "#16A34A" },
  { id: "arch", label: "Architecture & Planning",        icon: "🏛️", color: "#FDF4FF", accent: "#9333EA" },
  { id: "law",  label: "Law & Justice",                  icon: "⚖️", color: "#FFF1F2", accent: "#E11D48" },
  { id: "math", label: "Mathematics & Physics",          icon: "📐", color: "#F0F9FF", accent: "#0284C7" },
  { id: "eco",  label: "Economics",                      icon: "📈", color: "#F0FDF4", accent: "#059669" },
  { id: "eng",  label: "English & Literature",           icon: "📝", color: "#FFF8F0", accent: "#B45309" },
]

const COURSES = [
  // CSE
  { id: 1,  code: "CSE101", name: "Introduction to Programming",        faculty: "cse",  credits: 3, year: 1, semester: "Spring",  instructor: "Dr. Sarah Ahmed",       enrolled: 120, capacity: 150, rating: 4.8, tags: ["Beginner","Core"],        desc: "Fundamental programming concepts using Python. Variables, loops, functions and OOP basics." },
  { id: 2,  code: "CSE201", name: "Data Structures & Algorithms",       faculty: "cse",  credits: 3, year: 2, semester: "Fall",    instructor: "Prof. Tariq Hassan",    enrolled: 95,  capacity: 100, rating: 4.9, tags: ["Core","Competitive"],      desc: "Arrays, linked lists, trees, graphs, sorting and complexity analysis." },
  { id: 3,  code: "CSE301", name: "Database Management Systems",        faculty: "cse",  credits: 3, year: 3, semester: "Spring",  instructor: "Dr. Nadia Islam",       enrolled: 88,  capacity: 120, rating: 4.6, tags: ["Core","Practical"],        desc: "Relational databases, SQL, normalization, transactions and query optimization." },
  { id: 4,  code: "CSE401", name: "Machine Learning & AI",              faculty: "cse",  credits: 3, year: 4, semester: "Fall",    instructor: "Dr. Karim Hossain",     enrolled: 72,  capacity: 80,  rating: 4.7, tags: ["Elective","Advanced"],     desc: "Supervised/unsupervised learning, neural networks, model evaluation and projects." },
  { id: 5,  code: "CSE402", name: "Cloud Computing & DevOps",           faculty: "cse",  credits: 3, year: 4, semester: "Spring",  instructor: "Dr. Farhan Kabir",      enrolled: 60,  capacity: 80,  rating: 4.6, tags: ["Elective","Practical"],     desc: "AWS/GCP fundamentals, Docker, Kubernetes, CI/CD pipelines and microservices." },
  { id: 6,  code: "CSE403", name: "Software Engineering Capstone",      faculty: "cse",  credits: 4, year: 4, semester: "Summer",  instructor: "Prof. Lina Chowdhury",  enrolled: 45,  capacity: 50,  rating: 4.8, tags: ["Capstone","Core"],          desc: "Full-cycle software project: requirements, design, implementation, testing and deployment." },
  { id: 7,  code: "CSE310", name: "Operating Systems",                  faculty: "cse",  credits: 3, year: 3, semester: "Fall",    instructor: "Prof. Lina Chowdhury",  enrolled: 90,  capacity: 110, rating: 4.5, tags: ["Core"],                    desc: "Processes, threads, memory management, file systems and concurrency." },
  { id: 8,  code: "CSE210", name: "Computer Networks",                  faculty: "cse",  credits: 3, year: 2, semester: "Spring",  instructor: "Dr. Rafiq Uddin",       enrolled: 85,  capacity: 100, rating: 4.4, tags: ["Core"],                    desc: "TCP/IP, routing, protocols, network security and wireless communications." },
  // EEE
  { id: 9,  code: "EEE101", name: "Circuit Theory",                     faculty: "eee",  credits: 4, year: 1, semester: "Fall",    instructor: "Prof. Ayan Das",         enrolled: 110, capacity: 130, rating: 4.5, tags: ["Core","Lab"],              desc: "KVL, KCL, mesh analysis, Thevenin/Norton theorem and AC circuits." },
  { id: 10, code: "EEE201", name: "Electronics I",                      faculty: "eee",  credits: 3, year: 2, semester: "Spring",  instructor: "Dr. Reza Chowdhury",     enrolled: 88,  capacity: 100, rating: 4.3, tags: ["Core","Lab"],              desc: "Diodes, BJTs, MOSFETs, amplifier circuits and biasing techniques." },
  { id: 11, code: "EEE301", name: "Power Systems Engineering",          faculty: "eee",  credits: 3, year: 3, semester: "Fall",    instructor: "Dr. Sultana Begum",      enrolled: 65,  capacity: 90,  rating: 4.2, tags: ["Core"],                    desc: "Generation, transmission and distribution of electrical power." },
  { id: 12, code: "EEE310", name: "Microprocessors & Embedded Systems", faculty: "eee",  credits: 3, year: 3, semester: "Spring",  instructor: "Prof. Hasan Ali",        enrolled: 70,  capacity: 80,  rating: 4.6, tags: ["Elective","Practical"],    desc: "ARM architecture, assembly, interrupts, I/O interfacing and RTOS basics." },
  { id: 13, code: "EEE401", name: "Renewable Energy Systems",           faculty: "eee",  credits: 3, year: 4, semester: "Fall",    instructor: "Dr. Monira Khanam",      enrolled: 55,  capacity: 70,  rating: 4.5, tags: ["Elective","Advanced"],     desc: "Solar, wind, hydro and fuel cell technologies, grid integration and energy storage." },
  { id: 14, code: "EEE402", name: "Digital Signal Processing",          faculty: "eee",  credits: 3, year: 4, semester: "Spring",  instructor: "Prof. Ayan Das",         enrolled: 50,  capacity: 65,  rating: 4.4, tags: ["Core","Advanced"],          desc: "Discrete-time signals, Z-transform, DFT, FFT, FIR/IIR filter design." },
  { id: 15, code: "EEE403", name: "VLSI Design",                        faculty: "eee",  credits: 3, year: 4, semester: "Summer",  instructor: "Dr. Reza Chowdhury",     enrolled: 30,  capacity: 40,  rating: 4.7, tags: ["Elective","Advanced"],     desc: "CMOS logic, layout design, timing analysis, simulation with SPICE and HDL." },
  // BBA
  { id: 16, code: "BBA101", name: "Principles of Management",           faculty: "bba",  credits: 3, year: 1, semester: "Fall",    instructor: "Dr. Meena Akter",        enrolled: 140, capacity: 180, rating: 4.4, tags: ["Core","Beginner"],         desc: "Planning, organizing, leading and controlling in modern organizations." },
  { id: 17, code: "BBA201", name: "Financial Accounting",               faculty: "bba",  credits: 3, year: 2, semester: "Spring",  instructor: "Prof. Jabir Khan",       enrolled: 120, capacity: 150, rating: 4.3, tags: ["Core"],                    desc: "Balance sheets, income statements, cash flow and GAAP principles." },
  { id: 18, code: "BBA301", name: "Marketing Management",               faculty: "bba",  credits: 3, year: 3, semester: "Fall",    instructor: "Dr. Sonia Rahman",       enrolled: 105, capacity: 140, rating: 4.5, tags: ["Core","Case Study"],       desc: "Market segmentation, consumer behavior, branding and digital marketing." },
  { id: 19, code: "BBA401", name: "Strategic Management",               faculty: "bba",  credits: 3, year: 4, semester: "Spring",  instructor: "Prof. Ali Hasan",        enrolled: 80,  capacity: 100, rating: 4.7, tags: ["Elective","Advanced"],     desc: "Porter's framework, SWOT, competitive advantage and corporate strategy." },
  { id: 20, code: "BBA402", name: "International Business",             faculty: "bba",  credits: 3, year: 4, semester: "Fall",    instructor: "Dr. Meena Akter",        enrolled: 70,  capacity: 90,  rating: 4.5, tags: ["Elective"],                  desc: "Global trade, foreign direct investment, exchange rates and multinational strategy." },
  { id: 21, code: "BBA403", name: "Entrepreneurship & Innovation",      faculty: "bba",  credits: 3, year: 4, semester: "Summer",  instructor: "Prof. Jabir Khan",       enrolled: 50,  capacity: 60,  rating: 4.8, tags: ["Elective","Practical"],    desc: "Idea generation, lean startup, business model canvas, funding and pitch deck." },
  // Architecture
  { id: 22, code: "ARC101", name: "Introduction to Architecture",       faculty: "arch", credits: 4, year: 1, semester: "Fall",    instructor: "Prof. Dina Alam",        enrolled: 55,  capacity: 60,  rating: 4.9, tags: ["Core","Studio"],           desc: "History, theory and principles of architectural design and drawing." },
  { id: 23, code: "ARC201", name: "Structural Systems",                 faculty: "arch", credits: 3, year: 2, semester: "Spring",  instructor: "Dr. Rafat Islam",        enrolled: 48,  capacity: 60,  rating: 4.5, tags: ["Core"],                    desc: "Loads, beams, columns, trusses and structural analysis for architects." },
  { id: 24, code: "ARC301", name: "Urban Design & Planning",            faculty: "arch", credits: 3, year: 3, semester: "Fall",    instructor: "Prof. Dina Alam",        enrolled: 40,  capacity: 50,  rating: 4.7, tags: ["Core","Studio"],           desc: "Urban morphology, zoning, public space design, sustainable city planning." },
  { id: 25, code: "ARC401", name: "Thesis Project I",                   faculty: "arch", credits: 6, year: 4, semester: "Fall",    instructor: "Dr. Rafat Islam",        enrolled: 38,  capacity: 40,  rating: 4.9, tags: ["Capstone","Studio"],       desc: "Independent architectural thesis: site analysis, concept development and design documentation." },
  { id: 26, code: "ARC402", name: "Sustainable Architecture",           faculty: "arch", credits: 3, year: 4, semester: "Spring",  instructor: "Prof. Kamrul Hasan",     enrolled: 35,  capacity: 45,  rating: 4.6, tags: ["Elective","Advanced"],     desc: "Green building standards, passive design strategies, LEED certification and net-zero design." },
  // Law
  { id: 27, code: "LAW101", name: "Introduction to Legal Studies",      faculty: "law",  credits: 3, year: 1, semester: "Fall",    instructor: "Prof. Nasrin Jahan",     enrolled: 90,  capacity: 120, rating: 4.6, tags: ["Core","Beginner"],         desc: "Legal systems, sources of law, constitutional framework and rights." },
  { id: 28, code: "LAW201", name: "Contract Law",                       faculty: "law",  credits: 3, year: 2, semester: "Spring",  instructor: "Dr. Amir Hossain",       enrolled: 75,  capacity: 100, rating: 4.4, tags: ["Core"],                    desc: "Formation, validity, performance and breach of contracts." },
  { id: 29, code: "LAW301", name: "Criminal Law & Procedure",           faculty: "law",  credits: 3, year: 3, semester: "Fall",    instructor: "Prof. Nasrin Jahan",     enrolled: 70,  capacity: 90,  rating: 4.5, tags: ["Core"],                    desc: "Elements of crime, defences, arrest, investigation and trial procedure." },
  { id: 30, code: "LAW401", name: "Corporate & Commercial Law",         faculty: "law",  credits: 3, year: 4, semester: "Fall",    instructor: "Dr. Amir Hossain",       enrolled: 60,  capacity: 80,  rating: 4.5, tags: ["Elective","Advanced"],     desc: "Company formation, directors duties, mergers, acquisitions and securities regulation." },
  { id: 31, code: "LAW402", name: "International Law",                  faculty: "law",  credits: 3, year: 4, semester: "Spring",  instructor: "Prof. Shahida Begum",    enrolled: 55,  capacity: 70,  rating: 4.6, tags: ["Elective"],                  desc: "Treaties, state responsibility, diplomatic relations, WTO and human rights law." },
  { id: 32, code: "LAW403", name: "Moot Court & Legal Practice",        faculty: "law",  credits: 2, year: 4, semester: "Summer",  instructor: "Dr. Amir Hossain",       enrolled: 40,  capacity: 50,  rating: 4.7, tags: ["Practical","Elective"],    desc: "Courtroom advocacy, drafting pleadings, mock trials and client counselling skills." },
  // Math & Physics
  { id: 33, code: "MAT101", name: "Calculus I",                         faculty: "math", credits: 3, year: 1, semester: "Fall",    instructor: "Dr. Zahir Ahmad",        enrolled: 180, capacity: 200, rating: 4.3, tags: ["Core","Foundational"],     desc: "Limits, derivatives, integrals and their applications in engineering." },
  { id: 34, code: "MAT201", name: "Linear Algebra",                     faculty: "math", credits: 3, year: 2, semester: "Spring",  instructor: "Prof. Rima Begum",       enrolled: 130, capacity: 160, rating: 4.5, tags: ["Core"],                    desc: "Vectors, matrices, eigenvalues, linear transformations and applications." },
  { id: 35, code: "PHY101", name: "Physics for Engineers",              faculty: "math", credits: 4, year: 1, semester: "Fall",    instructor: "Dr. Kabir Uddin",        enrolled: 160, capacity: 200, rating: 4.2, tags: ["Core","Lab"],              desc: "Mechanics, thermodynamics, optics, waves and modern physics fundamentals." },
  { id: 36, code: "MAT301", name: "Differential Equations",             faculty: "math", credits: 3, year: 3, semester: "Fall",    instructor: "Dr. Zahir Ahmad",        enrolled: 110, capacity: 140, rating: 4.4, tags: ["Core"],                    desc: "ODEs, PDEs, Laplace transforms, Fourier series and boundary value problems." },
  { id: 37, code: "MAT401", name: "Numerical Methods",                  faculty: "math", credits: 3, year: 4, semester: "Spring",  instructor: "Prof. Rima Begum",       enrolled: 85,  capacity: 100, rating: 4.5, tags: ["Core","Practical"],        desc: "Root-finding, interpolation, numerical integration, ODEs and linear system solvers." },
  { id: 38, code: "MAT402", name: "Statistical Inference",              faculty: "math", credits: 3, year: 4, semester: "Fall",    instructor: "Dr. Selim Reza",         enrolled: 90,  capacity: 110, rating: 4.4, tags: ["Core","Advanced"],          desc: "Hypothesis testing, confidence intervals, regression analysis and Bayesian methods." },
  { id: 39, code: "MAT403", name: "Applied Mathematics Workshop",       faculty: "math", credits: 2, year: 4, semester: "Summer",  instructor: "Dr. Kabir Uddin",        enrolled: 50,  capacity: 60,  rating: 4.3, tags: ["Elective","Practical"],    desc: "Applied problem solving using MATLAB and Python: simulation, optimisation and modelling." },
  // Economics
  { id: 40, code: "ECO101", name: "Principles of Microeconomics",       faculty: "eco",  credits: 3, year: 1, semester: "Fall",    instructor: "Dr. Taslima Haque",      enrolled: 155, capacity: 180, rating: 4.6, tags: ["Core","Beginner"],         desc: "Supply, demand, elasticity, consumer theory, firm behaviour and market structures." },
  { id: 41, code: "ECO102", name: "Principles of Macroeconomics",       faculty: "eco",  credits: 3, year: 1, semester: "Spring",  instructor: "Prof. Rezaul Karim",     enrolled: 145, capacity: 180, rating: 4.5, tags: ["Core","Beginner"],         desc: "GDP, inflation, unemployment, monetary policy, fiscal policy and growth theories." },
  { id: 42, code: "ECO201", name: "Intermediate Microeconomics",        faculty: "eco",  credits: 3, year: 2, semester: "Fall",    instructor: "Dr. Taslima Haque",      enrolled: 110, capacity: 140, rating: 4.4, tags: ["Core"],                    desc: "Consumer and producer theory, game theory, welfare economics and market failures." },
  { id: 43, code: "ECO202", name: "Econometrics I",                     faculty: "eco",  credits: 3, year: 2, semester: "Spring",  instructor: "Prof. Rezaul Karim",     enrolled: 95,  capacity: 120, rating: 4.3, tags: ["Core","Practical"],        desc: "OLS regression, hypothesis testing, heteroskedasticity, multicollinearity and panel data." },
  { id: 44, code: "ECO301", name: "Development Economics",              faculty: "eco",  credits: 3, year: 3, semester: "Fall",    instructor: "Dr. Nafisa Ahmed",       enrolled: 85,  capacity: 100, rating: 4.7, tags: ["Elective"],                  desc: "Poverty, inequality, human capital, microfinance, foreign aid and growth in developing nations." },
  { id: 45, code: "ECO302", name: "International Economics",            faculty: "eco",  credits: 3, year: 3, semester: "Spring",  instructor: "Prof. Rezaul Karim",     enrolled: 80,  capacity: 100, rating: 4.5, tags: ["Core"],                    desc: "Comparative advantage, trade policy, balance of payments, exchange rates and globalization." },
  { id: 46, code: "ECO401", name: "Public Economics & Policy",          faculty: "eco",  credits: 3, year: 4, semester: "Fall",    instructor: "Dr. Taslima Haque",      enrolled: 65,  capacity: 80,  rating: 4.6, tags: ["Elective","Advanced"],     desc: "Public goods, externalities, taxation, social insurance and cost-benefit analysis." },
  { id: 47, code: "ECO402", name: "Financial Economics",                faculty: "eco",  credits: 3, year: 4, semester: "Spring",  instructor: "Prof. Shafiq Mullick",   enrolled: 60,  capacity: 75,  rating: 4.5, tags: ["Elective","Advanced"],     desc: "Asset pricing, portfolio theory, derivatives, risk management and market efficiency." },
  { id: 48, code: "ECO403", name: "Behavioural Economics",              faculty: "eco",  credits: 3, year: 4, semester: "Summer",  instructor: "Dr. Nafisa Ahmed",       enrolled: 45,  capacity: 60,  rating: 4.8, tags: ["Elective","Advanced"],     desc: "Bounded rationality, nudge theory, heuristics, biases and experimental economics." },
  // English
  { id: 49, code: "ENG101", name: "Academic Writing & Composition",     faculty: "eng",  credits: 3, year: 1, semester: "Fall",    instructor: "Ms. Farida Sultana",     enrolled: 200, capacity: 240, rating: 4.5, tags: ["Core","Beginner"],         desc: "Essay structure, thesis development, research writing, citations and academic conventions." },
  { id: 50, code: "ENG102", name: "Introduction to Literature",         faculty: "eng",  credits: 3, year: 1, semester: "Spring",  instructor: "Dr. Ananya Roy",         enrolled: 170, capacity: 200, rating: 4.7, tags: ["Core","Beginner"],         desc: "Short stories, poetry, drama and novels; close reading and critical response writing." },
  { id: 51, code: "ENG201", name: "British Literature",                 faculty: "eng",  credits: 3, year: 2, semester: "Fall",    instructor: "Dr. Ananya Roy",         enrolled: 120, capacity: 150, rating: 4.6, tags: ["Core"],                    desc: "From Chaucer to the Modernists: major works, movements and historical contexts." },
  { id: 52, code: "ENG202", name: "Creative Writing",                   faculty: "eng",  credits: 3, year: 2, semester: "Spring",  instructor: "Ms. Farida Sultana",     enrolled: 80,  capacity: 90,  rating: 4.9, tags: ["Elective","Studio"],       desc: "Fiction, poetry and creative non-fiction workshops with peer critique and revision." },
  { id: 53, code: "ENG203", name: "English for Professional Communication", faculty: "eng", credits: 3, year: 2, semester: "Summer", instructor: "Mr. Rashed Mahmud", enrolled: 100, capacity: 120, rating: 4.4, tags: ["Core","Practical"],        desc: "Business emails, reports, presentations, negotiation language and cross-cultural communication." },
  { id: 54, code: "ENG301", name: "Postcolonial Literature",            faculty: "eng",  credits: 3, year: 3, semester: "Fall",    instructor: "Dr. Ananya Roy",         enrolled: 75,  capacity: 90,  rating: 4.7, tags: ["Elective"],                  desc: "Literature from South Asia, Africa and the Caribbean: identity, power and resistance." },
  { id: 55, code: "ENG302", name: "Linguistics & Language Study",       faculty: "eng",  credits: 3, year: 3, semester: "Spring",  instructor: "Dr. Salma Yusuf",        enrolled: 70,  capacity: 85,  rating: 4.5, tags: ["Core"],                    desc: "Phonology, morphology, syntax, semantics and pragmatics with applied exercises." },
  { id: 56, code: "ENG401", name: "Comparative World Literature",       faculty: "eng",  credits: 3, year: 4, semester: "Fall",    instructor: "Dr. Ananya Roy",         enrolled: 60,  capacity: 75,  rating: 4.8, tags: ["Elective","Advanced"],     desc: "Canonical works across cultures: themes of identity, exile, war and modernity." },
  { id: 57, code: "ENG402", name: "Research Methods in Literature",     faculty: "eng",  credits: 3, year: 4, semester: "Spring",  instructor: "Dr. Salma Yusuf",        enrolled: 55,  capacity: 70,  rating: 4.6, tags: ["Core","Advanced"],          desc: "Literary theory, archival research, MLA formatting and thesis/dissertation writing." },
  { id: 58, code: "ENG403", name: "Senior Thesis Seminar",              faculty: "eng",  credits: 4, year: 4, semester: "Summer",  instructor: "Ms. Farida Sultana",     enrolled: 35,  capacity: 40,  rating: 4.9, tags: ["Capstone"],                 desc: "Independent research, thesis drafting, revision workshops and final oral defence." },
]

const YEARS     = ["All Years", "Year 1", "Year 2", "Year 3", "Year 4"]
const SEMESTERS = ["All Semesters", "Fall", "Spring", "Summer"]

/* -- Helpers ---------------------------------------------- */
function getAvailability(enrolled, capacity) {
  const pct = (enrolled / capacity) * 100
  if (pct >= 95) return { label: "Full",        color: "#EF4444", bg: "#FEF2F2" }
  if (pct >= 75) return { label: "Almost Full", color: "#F59E0B", bg: "#FFFBEB" }
  return               { label: "Open",         color: "#10B981", bg: "#ECFDF5" }
}

function StarRating({ rating }) {
  const full  = Math.floor(rating)
  const empty = 5 - full
  return (
    <span className="course-card-rating" aria-label={"Rating: " + rating + " out of 5"}>
      {"★".repeat(full)}{"☆".repeat(empty)}
      <span className="rating-num">{rating}</span>
    </span>
  )
}

/* -- Course Card ------------------------------------------ */
function CourseCard({ course, faculty }) {
  const [bookmarked, setBookmarked] = useState(false)
  const avail   = getAvailability(course.enrolled, course.capacity)
  const fillPct = Math.round((course.enrolled / course.capacity) * 100)

  return (
    <div className="course-card" id={"course-card-" + course.id}>
      <div className="course-card-header" style={{ background: faculty.color }}>
        <span className="course-card-emoji" aria-hidden="true">{faculty.icon}</span>
        <div className="course-card-header-right">
          <span className="course-card-code">{course.code}</span>
          <button
            className={"course-bookmark-btn" + (bookmarked ? " bookmarked" : "")}
            onClick={() => setBookmarked(b => !b)}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark course"}
            id={"bookmark-" + course.id}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div className="course-card-body">
        <h3 className="course-card-name">{course.name}</h3>
        <p className="course-card-instructor">👤 {course.instructor}</p>
        <p className="course-card-desc">{course.desc}</p>

        <div className="course-card-tags">
          {course.tags.map(tag => <span key={tag} className="course-tag">{tag}</span>)}
        </div>

        <div className="course-card-stats">
          <span>📅 {course.semester}</span>
          <span>🎓 Year {course.year}</span>
          <span>📋 {course.credits} cr.</span>
        </div>

        <StarRating rating={course.rating} />

        <div className="course-card-footer">
          <div className="course-enrollment">
            <div className="enrollment-bar-track">
              <div className="enrollment-bar-fill" style={{ width: fillPct + "%", background: avail.color }} />
            </div>
            <span className="enrollment-text">{course.enrolled}/{course.capacity}</span>
          </div>
          <span className="course-avail-badge" style={{ color: avail.color, background: avail.bg }}>
            {avail.label}
          </span>
        </div>

        <button
          className="course-enroll-btn"
          id={"enroll-btn-" + course.id}
          disabled={avail.label === "Full"}
          style={{ background: faculty.accent }}
        >
          {avail.label === "Full" ? "Join Waitlist" : "View Details"}
        </button>
      </div>
    </div>
  )
}

/* -- Faculty Section Header ------------------------------- */
function FacultyHeader({ faculty, count }) {
  return (
    <div className="faculty-section-header" id={"faculty-" + faculty.id}>
      <div className="faculty-icon-wrap" style={{ background: faculty.color }}>
        <span>{faculty.icon}</span>
      </div>
      <div>
        <h2 className="faculty-name">{faculty.label}</h2>
        <p className="faculty-count">{count} course{count !== 1 ? "s" : ""}</p>
      </div>
    </div>
  )
}

/* -- Main Page -------------------------------------------- */
export default function CoursesPage() {
  const [searchQuery,    setSearchQuery]    = useState("")
  const [activeFaculty,  setActiveFaculty]  = useState("all")
  const [activeYear,     setActiveYear]     = useState("All Years")
  const [activeSemester, setActiveSemester] = useState("All Semesters")
  const [viewMode,       setViewMode]       = useState("grid")

  const filtered = useMemo(() => {
    let r = [...COURSES]
    if (activeFaculty !== "all") r = r.filter(c => c.faculty === activeFaculty)
    if (activeYear !== "All Years") {
      const yr = parseInt(activeYear.replace("Year ", ""))
      r = r.filter(c => c.year === yr)
    }
    if (activeSemester !== "All Semesters") r = r.filter(c => c.semester === activeSemester)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      r = r.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return r
  }, [searchQuery, activeFaculty, activeYear, activeSemester])

  const grouped = useMemo(() => {
    if (activeFaculty !== "all") return null
    const map = {}
    for (const fac of FACULTIES) {
      const courses = filtered.filter(c => c.faculty === fac.id)
      if (courses.length > 0) map[fac.id] = courses
    }
    return map
  }, [filtered, activeFaculty])

  const facultyMap = useMemo(() => Object.fromEntries(FACULTIES.map(f => [f.id, f])), [])
  const total = filtered.length

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="courses" />

      <main className="dashboard-main" aria-label="Course catalog">

        {/* Header */}
        <div className="courses-page-header">
          <div>
            <h1 className="dashboard-greeting">Course Catalog 📚</h1>
            <p className="dashboard-date">Browse {COURSES.length} courses across {FACULTIES.length} faculties</p>
          </div>
          <div className="view-toggle" role="group" aria-label="View mode">
            <button id="view-grid-btn" className={"view-toggle-btn" + (viewMode === "grid" ? " active" : "")} onClick={() => setViewMode("grid")} title="Grid view">⊞</button>
            <button id="view-list-btn" className={"view-toggle-btn" + (viewMode === "list" ? " active" : "")} onClick={() => setViewMode("list")} title="List view">☰</button>
          </div>
        </div>

        {/* Search */}
        <div className="courses-search-bar">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="courses-search-input"
            type="search"
            className="courses-search-input"
            placeholder="Search by course name, code, instructor or keyword…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search courses"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery("")} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* Filters */}
        <div className="courses-filter-row">
          <div className="filter-group" role="group" aria-label="Filter by faculty">
            <button id="filter-faculty-all" className={"filter-pill" + (activeFaculty === "all" ? " active" : "")} onClick={() => setActiveFaculty("all")}>All Faculties</button>
            {FACULTIES.map(fac => (
              <button
                key={fac.id}
                id={"filter-faculty-" + fac.id}
                className={"filter-pill" + (activeFaculty === fac.id ? " active" : "")}
                onClick={() => setActiveFaculty(fac.id)}
              >
                {fac.icon} {fac.label.split(" ")[0]}
              </button>
            ))}
          </div>
          <div className="filter-selects">
            <select id="filter-year"     className="filter-select" value={activeYear}     onChange={e => setActiveYear(e.target.value)}     aria-label="Filter by year">{YEARS.map(y => <option key={y}>{y}</option>)}</select>
            <select id="filter-semester" className="filter-select" value={activeSemester} onChange={e => setActiveSemester(e.target.value)} aria-label="Filter by semester">{SEMESTERS.map(s => <option key={s}>{s}</option>)}</select>
          </div>
        </div>

        {/* Result count */}
        <p className="courses-result-count">{total === 0 ? "No courses match your search." : "Showing " + total + " course" + (total !== 1 ? "s" : "")}</p>

        {/* Empty state */}
        {total === 0 && (
          <div className="courses-empty-state">
            <span className="empty-icon">📭</span>
            <h3>No results found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Single-faculty grid */}
        {total > 0 && activeFaculty !== "all" && (
          <div className={viewMode === "grid" ? "course-grid" : "course-list"}>
            {filtered.map(c => <CourseCard key={c.id} course={c} faculty={facultyMap[c.faculty]} />)}
          </div>
        )}

        {/* Grouped by faculty */}
        {total > 0 && activeFaculty === "all" && grouped && FACULTIES.filter(f => grouped[f.id]).map(faculty => (
          <div key={faculty.id} className="faculty-section">
            <FacultyHeader faculty={faculty} count={grouped[faculty.id].length} />
            <div className={viewMode === "grid" ? "course-grid" : "course-list"}>
              {grouped[faculty.id].map(c => <CourseCard key={c.id} course={c} faculty={faculty} />)}
            </div>
          </div>
        ))}

      </main>
    </div>
  )
}
