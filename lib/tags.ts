import type { Categories, PromptTag } from "./types"

export const DEFAULT_TAGS: PromptTag[] = [
  //Writing Category tags:
  { id: "creativewriting", name: "Creative Writing", category: "writing" },
  { id: "copywriting", name: "Copywriting", category: "writing" },
  { id: "socialmedia", name: "Social Media", category: "writing" },
  { id: "blogging", name: "Blogging", category: "writing" },
  { id: "emailwriting", name: "Email Writing", category: "writing" },
  { id: "twitterthreads", name: "Twitter Threads", category: "writing" },
  { id: "linkedinposts", name: "LinkedIn Posts", category: "writing" },
  { id: "productdescriptions", name: "Product Descriptions", category: "writing" },
  { id: "seo", name: "SEO", category: "writing" },

  //Coding Category tags:
  { id: "codegeneration", name: "Code Generation", category: "coding" },
  { id: "debugging", name: "Debugging", category: "coding" },
  { id: "codeexplanation", name: "Code Explanation", category: "coding" },
  { id: "refactoring", name: "Refactoring", category: "coding" },
  { id: "testing", name: "Testing", category: "coding" },
  { id: "codereview", name: "Code Review", category: "coding" },
  { id: "documentation", name: "Documentation", category: "coding" },
  { id: "apiintegration", name: "API Integration", category: "coding" },

  //Design Category tags:
  { id: "graphicdesign", name: "Graphic Design", category: "design" },
  { id: "uxui", name: "UX/UI", category: "design" },
  { id: "logodesign", name: "Logo Design", category: "design" },
  { id: "webdesign", name: "Web Design", category: "design" },
  { id: "branding", name: "Branding", category: "design" },
  { id: "characterdesign", name: "Character Design", category: "design" },

  //Business Category tags:
  { id: "marketanalysis", name: "Market Analysis", category: "business" },
  { id: "businessplanning", name: "Business Planning", category: "business" },
  { id: "financialmodeling", name: "Financial Modeling", category: "business" },
  { id: "salesstrategy", name: "Sales Strategy", category: "business" },
  { id: "customerresearch", name: "Customer Research", category: "business" },
  
  //Learning Category tags:
  { id: "languagelearning", name: "Language Learning", category: "learning" },
  { id: "tutoring", name: "Tutoring", category: "learning" },
  { id: "exampreparation", name: "Exam Preparation", category: "learning" },
  { id: "skilldevelopment", name: "Skill Development", category: "learning" },
  
  
  //Productivity Category tags:
  { id: "timeManagement", name: "Time Management", category: "productivity" },
  { id: "taskautomation", name: "Task Automation", category: "productivity" },
  { id: "workflowoptimization", name: "Workflow Optimization", category: "productivity" },
  { id: "noteTaking", name: "Note Taking", category: "productivity" },

  //Creativity Category tags:
  { id: "photogeneration", name: "Photo Generation", category: "creativity" },
  { id: "artcreation", name: "Art Creation", category: "creativity" },
  { id: "videogeneration", name: "Video Generation", category: "creativity" },
  

  //Others:
  { id: "others", name: "Others", category: "others" },
  
]

export const getTagById = (id: string): PromptTag | undefined => {
  return DEFAULT_TAGS.find((t) => t.id === id)
}

export const getTagsByCategory = (category: Categories): PromptTag[] => {
  return DEFAULT_TAGS.filter((t) => t.category === category.toLowerCase())
}
