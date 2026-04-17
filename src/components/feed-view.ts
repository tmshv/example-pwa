import { h, style } from "../lib/dom";

type Sample = {
	title: string;
	body: string;
	height: number;
	gradient?: string;
	tone?: "light" | "dark";
};

const SAMPLES: Sample[] = [
	{
		title: "WTF",
		body: "wtf",
		height: 140,
		gradient: "linear-gradient(140deg, #00c6ff 0%, #0072ff 45%, #8e2de2 100%)",
	},
	{
		title: "WTF2",
		body: "wtf2",
		height: 140,
		gradient: "linear-gradient(140deg, #00c6ff 0%, #0072ff 45%, #8e2de2 100%)",
	},
	{
		title: "Good morning",
		body: "Here is what is happening today.",
		height: 140,
	},
	{
		title: "Sunrise",
		body: "Warm peach fading into a soft coral.",
		height: 180,
		gradient: "linear-gradient(135deg, #ff9a8b 0%, #ff6a88 55%, #ff99ac 100%)",
		tone: "light",
	},
	{
		title: "Trending now",
		body: "Three stories worth your attention.",
		height: 150,
	},
	{
		title: "Deep ocean",
		body: "Cool indigo descending into midnight blue.",
		height: 220,
		gradient: "linear-gradient(160deg, #3a7bd5 0%, #1e3c72 60%, #0f1a3b 100%)",
		tone: "dark",
	},
	{
		title: "Weather",
		body: "Partly cloudy, 18\u00B0C, light breeze.",
		height: 110,
	},
	{
		title: "Citrus",
		body: "Bright lemon folding into tangerine.",
		height: 170,
		gradient: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
		tone: "light",
	},
	{
		title: "From the team",
		body: "Release notes for v1.2 are live.",
		height: 140,
	},
	{
		title: "Aurora",
		body: "Teal to violet with a whisper of pink.",
		height: 240,
		gradient: "linear-gradient(140deg, #00c6ff 0%, #0072ff 45%, #8e2de2 100%)",
		tone: "dark",
	},
	{
		title: "Offline-friendly",
		body: "All of this is cached by the service worker.",
		height: 150,
	},
	{
		title: "Mint",
		body: "Fresh green melting into aquamarine.",
		height: 190,
		gradient: "linear-gradient(130deg, #43e97b 0%, #38f9d7 100%)",
		tone: "light",
	},
	{
		title: "Safe-area demo",
		body: "Scroll to the bottom \u2014 the bar never clips.",
		height: 160,
	},
	{
		title: "Berry",
		body: "Magenta drifting into plum.",
		height: 210,
		gradient: "linear-gradient(150deg, #ff6a88 0%, #d83dff 55%, #4a00e0 100%)",
		tone: "dark",
	},
	{
		title: "Overscroll test",
		body: "Pull past the edges. Nothing stretches.",
		height: 130,
	},
	{
		title: "Graphite",
		body: "Slate gradient with a soft inner glow.",
		height: 180,
		gradient: "linear-gradient(145deg, #485563 0%, #29323c 100%)",
		tone: "dark",
	},
	{ title: "End of feed", body: "That is all for now.", height: 140 },
];

const CSS = `
  :host { display: block; }
  article {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 12px;
  }
  article.gradient {
    border: none;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  }
  article.gradient.tone-light {
    color: #1a1a1a;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.35);
  }
  h2 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  p  { font-size: 14px; color: var(--muted); line-height: 1.4; }
  article.gradient p { color: inherit; opacity: 0.9; }
`;

class FeedView extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		shadow.append(style(CSS));
		for (const s of SAMPLES) {
			const isGradient = Boolean(s.gradient);
			const classes = isGradient ? `gradient tone-${s.tone ?? "dark"}` : "";
			const inlineStyle = isGradient
				? `min-height: ${s.height}px; background: ${s.gradient};`
				: `min-height: ${s.height}px;`;
			const article = h(
				"article",
				{ class: classes, style: inlineStyle },
				h("h2", {}, s.title),
				h("p", {}, s.body),
			);
			shadow.append(article);
		}
	}
}

customElements.define("feed-view", FeedView);
