import { PromptCategory } from "./types"
import { 
  PenLine, 
  Palette, 
  Code, 
  Pencil, 
  Briefcase, 
  BookOpen, 
  Theater, 
  TrendingUp, 
  Wrench 
} from "lucide-react"

export const DEFAULT_CATEGORIES: PromptCategory[] = [
    {
        id: "writing",
        name: "Writing",
        gradient: "from-pink-400 to-red-500",
        icon: PenLine,
    },
    {
        id: "creativity",
        name: "Creativity",
        gradient: "from-yellow-400 to-pink-500",
        icon: Palette,
    },
    {
        id: "coding",
        name: "Coding",
        gradient: "from-cyan-400 to-blue-600",
        icon: Code,
    },
    {
        id: "design",
        name: "Design",
        gradient: "from-pink-400 to-rose-600",
        icon: Pencil,
    },
    {
        id: "business",
        name: "Business",
        gradient: "from-yellow-400 to-orange-600",
        icon: Briefcase,
    },
    {
        id: "learning",
        name: "Learning",
        gradient: "from-green-400 to-emerald-600",
        icon: BookOpen,
    },
    {
        id: "entertainment",
        name: "Entertainment",
        gradient: "from-purple-400 to-indigo-600",
        icon: Theater,
    },
    {
        id: "productivity",
        name: "Productivity",
        gradient: "from-teal-400 to-cyan-600",
        icon: TrendingUp,
    },
    {
        id: "others",
        name: "Others",
        gradient: "from-gray-400 to-gray-600",
        icon: Wrench,
    }
]