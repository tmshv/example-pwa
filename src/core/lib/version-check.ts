const DEFAULT_POLL_INTERVAL = 30_000

type VersionPayload = { version?: string }

type WatchOptions = {
    pollInterval?: number
    signal?: AbortSignal
}

export async function* watchVersion(url: URL, opts: WatchOptions = {}): AsyncGenerator<string> {
    const interval = opts.pollInterval ?? DEFAULT_POLL_INTERVAL
    const { signal } = opts
    let lastSeen = __SW_VERSION__

    try {
        while (true) {
            if (signal?.aborted) return
            const version = await fetchVersion(url, signal)
            if (version && version !== lastSeen) {
                lastSeen = version
                yield version
            }
            await waitNext(interval, signal)
        }
    } catch (err) {
        if ((err as Error).name === "AbortError") return
        throw err
    }
}

async function fetchVersion(url: URL, signal?: AbortSignal): Promise<string | null> {
    try {
        const res = await fetch(url, { cache: "no-store", signal })
        if (!res.ok) return null
        const data = (await res.json()) as VersionPayload
        return data.version ?? null
    } catch (err) {
        if ((err as Error).name === "AbortError") throw err
        return null
    }
}

function waitNext(interval: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"))
            return
        }
        const cleanup = () => {
            clearTimeout(timer)
            document.removeEventListener("visibilitychange", onVisible)
            signal?.removeEventListener("abort", onAbort)
        }
        const onVisible = () => {
            if (document.visibilityState === "visible") {
                cleanup()
                resolve()
            }
        }
        const onAbort = () => {
            cleanup()
            reject(new DOMException("Aborted", "AbortError"))
        }
        const timer = setTimeout(() => {
            cleanup()
            resolve()
        }, interval)

        document.addEventListener("visibilitychange", onVisible)
        signal?.addEventListener("abort", onAbort)
    })
}
