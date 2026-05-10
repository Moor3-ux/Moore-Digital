import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useApi — fetches data and manages loading/error state.
 *
 * @param {Function} fetcher — async function that returns data
 * @param {Array}    deps    — dependencies that trigger a re-fetch
 */
export function useApi(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tick,    setTick]    = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcherRef.current()
      .then(d  => { if (!cancelled) { setData(d);           setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message);  setLoading(false) } })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const refetch = useCallback(() => setTick(t => t + 1), [])

  return { data, loading, error, refetch }
}
