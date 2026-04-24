import { h } from "../lib/dom"
import "./app-top-bar.css"

class AppTopBar extends HTMLElement {
    static observedAttributes = ["status"]
    private labelEl: HTMLElement

    constructor() {
        super()
        this.labelEl = h("span", { class: "label" }, "[ online ]")
    }

    connectedCallback() {
        if (this.childElementCount > 0) return

        const chip = h("button", { class: "chip", type: "button" }, h("span", { class: "swatch" }), this.labelEl)
        chip.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("check-update", { bubbles: true }))
        })

        this.append(h("h1", {}, "PWA LAYOUT DEMO"), chip)
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        if (name === "status") {
            this.labelEl.textContent =
                value === "update" ? "[ update ]" : value === "offline" ? "[ offline ]" : "[ online ]"
        }
    }
}

customElements.define("app-top-bar", AppTopBar)
