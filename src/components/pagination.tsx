import { Link } from 'preact-router'


interface PaginationProps {
  offset: number,
  limit: number,
  total: number
}


export function Pagination({ offset, limit, total }: PaginationProps) {
  const path = window.location.pathname
  const page = Math.floor(offset / limit) + 1
  const pages = Math.ceil(total / limit)
  const prevOffset = offset - limit
  const nextOffset = offset + limit

  return (
    <div class="pagination">
      <span>
        {offset > 0 &&
          <Link href={`${path}?offset=${prevOffset}&limit=${limit}`}>Previous</Link>
        }
      </span>
      <span>Page {page} of {pages}</span>
      <span>
        {page < pages &&
        <Link href={`${path}?offset=${nextOffset}&limit=${limit}`}>Next</Link>
        }
      </span>
    </div>
  )
}
