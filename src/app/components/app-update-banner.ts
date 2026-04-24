import { h } from "../lib/dom"
import "./app-update-banner.css"

const BASE = import.meta.env.BASE_URL

class AppUpdateBanner extends HTMLElement {
    connectedCallback() {
        if (this.childElementCount > 0) return

        const reload = h("button", { class: "primary", type: "button" }, "[ RELOAD ]")
        reload.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("reload-app", { bubbles: true }))
        })

        const dismiss = h("button", { type: "button" }, "[ DISMISS ]")
        dismiss.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("dismiss-update", { bubbles: true }))
        })

        this.append(
            h("img", {
                class: "pattern",
                src: `${BASE}patterns/pattern-dots.svg`,
                "aria-hidden": "true",
            }),
            h("span", { class: "label" }, "NEW VERSION AVAILABLE"),
            h("div", { class: "actions" }, reload, dismiss),
        )
    }
}

customElements.define("app-update-banner", AppUpdateBanner)
