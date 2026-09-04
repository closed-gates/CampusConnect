import { ACCOUNT_CATEGORIES, ACCOUNT_ROLES } from '../../models/accountFreezeModel.js'
import { useAccountFreezeController } from '../../controllers/accountFreezeController.js'
import './AccountFreezeView.css'

export default function AccountFreezePanel() {
  const c = useAccountFreezeController()
  return (
      <div className="freeze-page">
        <header className="freeze-header">
          <div><h1>Freeze Accounts 🧊</h1><p>Temporarily block student or faculty access without deleting their data.</p></div>
          <button className="btn btn--outline" onClick={c.loadAccounts} disabled={c.loading}>Refresh</button>
        </header>
        <section className="section-card">
          <div className="freeze-filters">
            <div><label className="freeze-search-label" htmlFor="account-freeze-search">Search accounts</label><input id="account-freeze-search" className="freeze-search" placeholder="Search by name, ID, email, or role…" value={c.search} onChange={e => c.setSearch(e.target.value)} /></div>
            <div><label className="freeze-search-label" htmlFor="account-freeze-category">Category</label><select id="account-freeze-category" className="freeze-search" value={c.category} onChange={e => c.setCategory(e.target.value)}>{ACCOUNT_CATEGORIES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          </div>
          {c.error && <div className="freeze-alert freeze-alert--error" role="alert">{c.error}</div>}
          {c.message && <div className="freeze-alert freeze-alert--success" role="status">{c.message}</div>}
          {c.loading ? <p className="freeze-empty">Loading accounts…</p> : (
            <div className="freeze-table-wrap"><table className="freeze-table">
              <thead><tr><th>User</th><th>ID</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{c.visibleAccounts.length === 0 ? <tr><td colSpan="5" className="freeze-empty">No matching student or faculty account.</td></tr> : c.visibleAccounts.map(account => (
                <tr key={account.userId}>
                  <td><strong>{account.fullName}</strong><small>{account.email}</small></td>
                  <td><code>{account.userId}</code></td><td>{ACCOUNT_ROLES[account.role] || account.role}</td>
                  <td><span className={`freeze-status ${account.frozen ? 'is-frozen' : 'is-active'}`}>{account.frozen ? 'Frozen' : 'Active'}</span></td>
                  <td><button className={`freeze-action ${account.frozen ? 'unfreeze' : ''}`} disabled={c.updatingId === account.userId} onClick={() => c.handleToggleFreeze(account)}>{c.updatingId === account.userId ? 'Updating…' : account.frozen ? 'Unfreeze' : 'Freeze'}</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </section>
      </div>
  )
}
