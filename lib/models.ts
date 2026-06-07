import { Models } from "./types"

export const DEFAULT_MODELS: Models[] = [
    {
        id: "gpt-5",
        name: "GPT-5",
        company: "OpenAI",
        baseurl: "https://chatgpt.com/?prompt=",
    },
    {
        id: "claude-4.5",
        name: "Claude 4.5",
        company: "Anthropic",
        baseurl: "https://claude.ai/new?q=",
    },
    {
        id: "gemini-2.5",
        name: "Gemini 2.5",
        company: "Google DeepMind",
        baseurl: "",
    },
    {
        id: "sora",
        name: "Sora",
        company: "AI21 Labs",
        baseurl: "",
    },
    {
        id: "dalle-3",
        name: "DALL·E 3",
        company: "OpenAI",
        baseurl: "",
    },
    {
        id: "midjourney",
        name: "Midjourney",
        company: "Midjourney Inc.",
        baseurl: "",
    },
    {
        id: "stablediffusion",
        name: "Stable Diffusion",
        company: "Stability AI",
        baseurl: "",
    },
    {
        id: "imagen-3",
        name: "Imagen 3",
        company: "Google DeepMind",
        baseurl:  "",
    },
    {
        id: "veo-3",
        name: "Veo 3",
        company: "Veo Robotics",
        baseurl: ""
    },
    {
        id: "midjourney-video",
        name: "Midjourney Video",
        company: "Midjourney Inc.",
        baseurl: ""
    },
    {
        id: "grok-4",
        name: "Grok 4",
        company: "XAI",
        baseurl: ""
    },
    {
        id: "other",
        name: "Other",
        company: "Various",
        baseurl: ""
    },
]

