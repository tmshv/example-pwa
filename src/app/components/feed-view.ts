import { SAMPLES } from "../const"
import { h } from "../lib/dom"

class FeedView extends HTMLElement {
    connectedCallback() {
        if (this.childElementCount > 0) return

        for (const s of SAMPLES) {
            const attrs: Record<string, string> = {
                title: s.title,
                body: s.body,
                height: String(s.height),
            }
            if (s.border === "dashed") attrs["data-border"] = "dashed"
            if (s.pattern) attrs["data-pattern"] = s.pattern
            if (s.from && s.to) {
                attrs["data-from"] = s.from
                attrs["data-to"] = s.to
                if (s.angle !== undefined) attrs["data-angle"] = String(s.angle)
            }
            this.append(h("feed-card", attrs))
        }
    }
}

customElements.define("feed-view", FeedView)
