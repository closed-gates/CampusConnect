import './FrozenAccountDialog.css'

export default function FrozenAccountDialog({ message, onClose }) {
  if (!message) return null
  return (
    <div className="frozen-dialog-backdrop" role="presentation">
      <div className="frozen-dialog" role="alertdialog" aria-modal="true" aria-labelledby="frozen-dialog-title">
        <div className="frozen-dialog-icon">🧊</div>
        <h2 id="frozen-dialog-title">Account frozen</h2>
        <p>{message}</p>
        <button type="button" className="btn btn-primary" onClick={onClose} autoFocus>Understood</button>
      </div>
    </div>
  )
}
