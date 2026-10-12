export default function Pager({ page, pages, onPage, label }) {
  if (pages <= 1) return null
  const numbers = Array.from({ length: pages }, (_, index) => index + 1)
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <button
        type="button"
        className="btn btn-outline !px-3 !py-2 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {numbers.map((number) => (
          <button
            key={number}
            type="button"
            aria-current={number === page ? 'page' : undefined}
            onClick={() => onPage(number)}
            className={`grid h-9 w-9 place-items-center border text-sm font-semibold ${
              number === page ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-navy'
            }`}
          >
            {number}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-outline !px-3 !py-2 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}
