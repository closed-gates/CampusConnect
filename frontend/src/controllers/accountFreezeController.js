import { useCallback, useEffect, useMemo, useState } from 'react'
import { matchesAccountCategory, matchesAccountSearch } from '../models/accountFreezeModel.js'
import { accountFreezeService } from '../services/accountFreezeService.js'

export function useAccountFreezeController() {
  const [accounts, setAccounts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAccounts = useCallback(async () => {
    setLoading(true); setError('')
    try { setAccounts(await accountFreezeService.list()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  const visibleAccounts = useMemo(
    () => accounts.filter(account => matchesAccountCategory(account, category) && matchesAccountSearch(account, search)),
    [accounts, category, search]
  )

  const handleToggleFreeze = useCallback(async account => {
    const nextFrozen = !account.frozen
    if (!window.confirm(`${nextFrozen ? 'Freeze' : 'Unfreeze'} ${account.fullName}'s account?`)) return
    setUpdatingId(account.userId); setError(''); setMessage('')
    try {
      const updated = await accountFreezeService.setFrozen(account.userId, nextFrozen)
      setAccounts(current => current.map(item => item.userId === updated.userId ? updated : item))
      setMessage(`${updated.fullName}'s account was ${updated.frozen ? 'frozen' : 'unfrozen'}.`)
    } catch (err) { setError(err.message) }
    finally { setUpdatingId('') }
  }, [])

  return { visibleAccounts, search, setSearch, category, setCategory, loading, updatingId, message, error, loadAccounts, handleToggleFreeze }
}
