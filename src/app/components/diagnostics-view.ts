import { Diagnostics, type DiagnosticsSnapshot } from "../lib/diagnostics"
import { h } from "../lib/dom"
import "./diagnostics-view.css"

let sharedDiagnostics: Diagnostics | null = null
export function getDiagnostics(): Diagnostics {
    if (!sharedDiagnostics) sharedDiagnostics = new Diagnostics()
    return sharedDiagnostics
}

function row(label: string, value: string): HTMLElement {
    return h("div", { class: "row" }, h("span", { class: "k" }, label), h("span", { class: "v" }, value))
}

function section(title: string, ...rows: HTMLElement[]): HTMLElement {
    return h("section", {}, h("h3", {}, `---- ${title.toUpperCase()} ----`), ...rows)
}

function build(snap: DiagnosticsSnapshot): DocumentFragment {
    const frag = document.createDocumentFragment()

    frag.append(
        section(
            "Safe area insets",
            row("top", snap.insets.top + "px"),
            row("right", snap.insets.right + "px"),
            row("bottom", snap.insets.bottom + "px"),
            row("left", snap.insets.left + "px"),
        ),
        section(
            "Viewport",
            row("innerWidth x innerHeight", snap.innerWidth + " x " + snap.innerHeight),
            row("visualViewport.height", snap.visualHeight + "px"),
            row("100dvh (measured)", snap.dvh + "px"),
            row("devicePixelRatio", String(snap.dpr)),
        ),
        section("Display mode", row("standalone", String(snap.standalone)), row("color scheme", snap.colorScheme)),
        section(
            "Network and SW",
            row("online", String(snap.online)),
            row("swState", snap.swState),
            row("swVersion", snap.swVersion),
        ),
        section("Scroll", row("scrollTop", snap.scrollTop + "px"), row("scrollMax", snap.scrollMax + "px")),
    )

    const platform = section("Platform", row("platform", snap.platform))
    platform.append(
        h("div", { class: "row wrap" }, h("span", { class: "k" }, "ua"), h("span", { class: "v small" }, snap.ua)),
    )
    frag.append(platform)

    return frag
}

class DiagnosticsView extends HTMLElement {
    private container = h("div")
    private unsubscribe?: () => void

    connectedCallback() {
        if (this.childElementCount === 0) this.append(this.container)
        const diag = getDiagnostics()
        this.unsubscribe = diag.subscribe(snap => {
            this.container.replaceChildren(build(snap))
        })
    }

    disconnectedCallback() {
        this.unsubscribe?.()
    }
}

customElements.define("diagnostics-view", DiagnosticsView)
