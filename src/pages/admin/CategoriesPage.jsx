import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../../lib/adminContext'

export default function CategoriesPage() {
  const { categories, products, createCategory, renameCategory, deleteCategory } = useAdmin()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const [rowError, setRowError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [working, setWorking] = useState('')

  async function onCreate(event) {
    event.preventDefault()
    setError('')
    setWorking('create')
    try {
      await createCategory(name)
      setName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setWorking('')
    }
  }

  function startEdit(category) {
    setEditing(category.id)
    setDraft(category.label)
    setRowError(null)
    setPendingDelete(null)
  }

  async function saveEdit(event) {
    event.preventDefault()
    setRowError(null)
    setWorking(editing)
    try {
      await renameCategory(editing, draft)
      setEditing(null)
    } catch (err) {
      setRowError({ id: editing, message: err.message })
    } finally {
      setWorking('')
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Catalogue</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Categories</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Products are filed under these categories. The site categories are already here. Rename them, remove them, or add new ones.
      </p>

      <form onSubmit={onCreate} className="mt-8 flex flex-col gap-3 border border-line bg-white p-5 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-semibold text-navy">
          New category
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Charge controllers" className="field" />
        </label>
        <button type="submit" className="btn btn-primary" disabled={working === 'create'} aria-busy={working === 'create'}>
          {working === 'create' ? 'Adding…' : 'Add category'}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}

      <ul className="mt-6 divide-y divide-line border border-line bg-white">
        {categories.length === 0 && (
          <li className="px-5 py-10 text-center text-muted">No categories yet. Add one to start uploading products.</li>
        )}
        {categories.map((category) => {
          const count = products.filter((product) => product.category === category.id).length
          const isEditing = editing === category.id
          return (
            <li key={category.id} className="px-5 py-4">
              {isEditing ? (
                <form onSubmit={saveEdit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="block flex-1 text-sm font-semibold text-navy">
                    <span className="sr-only">Category name</span>
                    <input value={draft} onChange={(event) => setDraft(event.target.value)} className="field mt-0" autoFocus />
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary !px-3 !py-2" disabled={working === category.id} aria-busy={working === category.id}>
                      {working === category.id ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" className="btn btn-outline !px-3 !py-2" disabled={working === category.id} onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-navy">{category.label}</h2>
                    <p className="text-sm text-muted">
                      {count} uploaded {count === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pendingDelete === category.id ? (
                      <>
                        <span className="self-center text-sm text-muted">Delete this category?</span>
                        <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => setPendingDelete(null)}>Cancel</button>
                        <button
                          type="button"
                          className="bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                          disabled={working === `delete:${category.id}`}
                          aria-busy={working === `delete:${category.id}`}
                          onClick={async () => {
                            setRowError(null)
                            setWorking(`delete:${category.id}`)
                            try {
                              await deleteCategory(category.id)
                              setPendingDelete(null)
                            } catch (err) {
                              setRowError({ id: category.id, message: err.message })
                              setPendingDelete(null)
                            } finally {
                              setWorking('')
                            }
                          }}
                        >
                          {working === `delete:${category.id}` ? 'Deleting…' : 'Delete'}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to={`/auth/admin/products/new?category=${category.id}`} className="btn btn-outline !px-3 !py-2">Add product</Link>
                        <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => startEdit(category)}>Rename</button>
                        <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => { setPendingDelete(category.id); setRowError(null) }}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {rowError?.id === category.id && (
                <p role="alert" className="mt-2 text-sm text-red-800">{rowError.message}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
