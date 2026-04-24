type Child = Node | string

export function h(tag: string, props: Record<string, string> = {}, ...children: Child[]): HTMLElement {
    const el = document.createElement(tag)
    for (const [k, v] of Object.entries(props)) {
        el.setAttribute(k, v)
    }
    for (const child of children) {
        el.append(typeof child === "string" ? document.createTextNode(child) : child)
    }
    return el
}
