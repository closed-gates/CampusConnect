import Sidebar from '../components/Sidebar.jsx'
import { useFacultyDirectoryController } from '../../controllers/facultyDirectoryController.js'
import { thesisStatusClass } from '../../models/facultyDirectoryModel.js'
import './FacultyDirectoryView.css'

export default function FacultyDirectoryView() {
  const ctrl = useFacultyDirectoryController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="faculty-directory" />
      <main className="dashboard-main faculty-directory-main">
        <header className="faculty-directory-hero">
          <div>
            <span className="directory-eyebrow">Campus community</span>
            <h1>Faculty & Staff Directory</h1>
            <p>Find BRACU CSE faculty and staff, verified contact information, and thesis supervision availability.</p>
          </div>
          <div className="directory-count"><strong>{ctrl.resultCount}</strong><span>people found</span></div>
        </header>

        <section className="directory-filters" aria-label="Directory filters">
          <label className="directory-search">
            <span aria-hidden="true">⌕</span>
            <input value={ctrl.query} onChange={event => ctrl.setQuery(event.target.value)} placeholder="Search by name, email, position, or category…" aria-label="Search faculty and staff" />
          </label>
          <select value={ctrl.category} onChange={event => ctrl.setCategory(event.target.value)} aria-label="Filter by category">
            {ctrl.categories.map(option => <option key={option}>{option}</option>)}
          </select>
          <select value={ctrl.thesisStatus} onChange={event => ctrl.setThesisStatus(event.target.value)} aria-label="Filter by thesis supervision status">
            {ctrl.thesisStatuses.map(option => <option key={option}>{option}</option>)}
          </select>
        </section>

        {ctrl.loading ? (
          <section className="directory-empty"><span>⌛</span><h2>Loading directory</h2><p>Reading current records from the database.</p></section>
        ) : ctrl.error ? (
          <section className="directory-empty"><span>!</span><h2>Unable to load directory</h2><p>{ctrl.error}</p><button onClick={ctrl.retry}>Try again</button></section>
        ) : ctrl.groups.length === 0 ? (
          <section className="directory-empty">
            <span>🔎</span><h2>No people found</h2><p>Try a different name, department, or role.</p>
            <button onClick={ctrl.clearFilters}>Clear filters</button>
          </section>
        ) : ctrl.groups.map(group => (
          <section className="directory-group" key={group.category}>
            <div className="directory-group-heading"><h2>{group.category}</h2><span>{group.people.length}</span></div>
            <div className="directory-grid">
              {group.people.map(person => (
                <article className={`directory-card ${ctrl.expandedId === person.id ? 'expanded' : ''}`} key={person.id}>
                  <div className="directory-card-top">
                    <div className="directory-avatar" style={{ '--avatar-color': person.color }}>{person.initials}</div>
                    <div className="directory-identity">
                      <div className="directory-role-line"><span>{person.position}</span><span className={`advisor-pill thesis-${thesisStatusClass(person.thesisStatus)}`}>{person.thesisStatus}</span></div>
                      <h3>{person.name}</h3><p>Department of Computer Science and Engineering</p>
                    </div>
                  </div>
                  <div className="directory-contact">
                    <a href={`mailto:${person.email}`}>✉ <span>{person.email}</span></a>
                    {person.profileUrl && <a href={person.profileUrl} target="_blank" rel="noreferrer">↗ <span>View BRACU profile</span></a>}
                  </div>
                  <button className="directory-details-button" onClick={() => ctrl.toggleDetails(person.id)} aria-expanded={ctrl.expandedId === person.id}>
                    {ctrl.expandedId === person.id ? 'Hide thesis details' : 'View thesis details'} <span>{ctrl.expandedId === person.id ? '↑' : '→'}</span>
                  </button>
                  {ctrl.expandedId === person.id && (
                    <div className="directory-advising-panel">
                      <div className="advising-panel-title"><strong>Thesis supervision</strong><span className={`advising-status status-${thesisStatusClass(person.thesisStatus)}`}>{person.thesisStatus}</span></div>
                      <dl><div><dt>Eligible level</dt><dd>{person.thesisLevel || 'Not published'}</dd></div><div><dt>Directory category</dt><dd>{person.category}</dd></div></dl>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
