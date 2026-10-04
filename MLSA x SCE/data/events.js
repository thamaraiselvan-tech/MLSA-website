// ============================================================================
// EVENTS & WINNERS DATA
// ============================================================================
// FIELDS FOR WINNERS:
//   name          - Winner name or Team name
//   position      - "1st", "2nd", "3rd"
//   department    - e.g. "CSBS", "AI & DS", "CSE"
//   year          - e.g. "2nd Year", "3rd Year"
//   projectTitle  - Title of the project built
//   description   - Brief 2-3 sentence overview of what they built & pitched
//   tools         - Array of tools used, e.g. ["Microsoft Copilot", "Microsoft Designer"]
//   members       - Array of student names on the team, e.g. ["Student A", "Student B"]
//   projectUrl    - Direct link to live website, Canva presentation deck, or GitHub repo
// ============================================================================

const EVENTS = [
  {
    id: 1,
    title: "Design Your Future - Portfolio Creation",
    tagline: "Create a Portfolio that represents You!",
    description: "Personal Portfolio is one of the most valuable assets for students, enabling them to showcase their skills, projects, achievements, and technical journey beyond a traditional resume. Participants are expected to create a digital version of themself to complete the event.",
    date: "2026-07-18T10:00",
    location: "Online",
    capacity: "",
    registrationDeadline: "2026-07-17T23:59",
    registrationUrl: "",
    isOpen: false,
    image: "assets/events/portfolio.jpeg",
    winners: [
      { 
        name: "Aarthi. R", 
        position: "1st", 
        department: "CSBS", 
        year: "2nd Year",
        projectTitle: "Developer Portfolio Website",
        description: "A clean, digital portfolio website built to showcase web projects, technical certifications, and GitHub repositories with responsive mobile layout.",
        tools: ["HTML5", "CSS3", "JavaScript", "GitHub Pages"],
        members: ["Aarthi. R"],
        projectUrl: "https://aarthi-ramu.github.io/my-portfolio/"
      },
      { 
        name: "Shrihari V", 
        position: "2nd", 
        department: "AI & DS", 
        year: "2nd Year",
        projectTitle: "AI & Data Science Portfolio",
        description: "Personal portfolio emphasizing machine learning projects, data analytics dashboards, and interactive technical documentation.",
        tools: ["HTML5", "CSS3", "Bootstrap", "Python"],
        members: ["Shrihari V"],
        projectUrl: "https://shrihari73.github.io/portfolio/#"
      },
      { 
        name: "Kamalini P", 
        position: "3rd", 
        department: "AI & DS", 
        year: "3rd Year",
        projectTitle: "Student Developer Showcase",
        description: "Interactive portfolio highlight page built during the Design Your Future workshop, featuring dark mode aesthetic and project cards.",
        tools: ["HTML5", "CSS3", "JavaScript"],
        members: ["Kamalini P"],
        projectUrl: "https://kamalini66.github.io/portfolio_web/"
      }
    ]
  },
  {
    id: 2,
    title: "AI StartUp Arena",
    tagline: "Build a Unicorn in 60 Minutes using Microsoft Copilot & Microsoft Designer",
    description: "AI Startup Arena is a fast-paced innovation challenge where participants use Microsoft Copilot and Microsoft Designer to transform an idea into a startup within 60 minutes. Working in teams of 3-4 members, participants will leverage Microsoft's AI tools to create a startup concept, build its brand identity, and develop a simple business model.",
    date: "2026-08-13T11:00",
    location: "Offline",
    capacity: "all students",
    registrationDeadline: "2026-08-07T10:00",
    registrationUrl: "https://forms.cloud.microsoft/r/ieXJvtJQrt",
    isOpen: true,
    image: "assets/events/aistartup.png",
    winners: [
      { 
        name: "Team MARK 44", 
        position: "1st", 
        department: "CSBS", 
        year: "3rd Year",
        projectTitle: "Escape Room Creator",
        description: "Escape AI is an AI-powered learning platform that transforms any topic into an interactive escape-room experience. It uses AI to generate engaging puzzles, questions, clues, and challenges based on the selected topic. The platform combines education with gamification to make learning more fun, interactive, and memorable. Students can explore concepts by solving challenges and progressing through different levels. Escape AI aims to improve learner engagement, critical thinking, and problem-solving skills through an innovative AI-driven approach.",
        tools: ["Microsoft Copilot", "Microsoft Designer", "Azure AI"],
        members: ["HARIHARAN K", "VIVIN RAJ V", "ANBU RAJA S", "GOWTHAM K"],
        projectUrl: "https://escape-ai-umber.vercel.app/" 
      },
      { 
        name: "Team OPS PROTOCOL", 
        position: "2nd", 
        department: "CSE", 
        year: "2nd Year",
        projectTitle: "Digital Crime Scene Investigator",
        description: "ARVIX is an AI-powered Digital Crime Scene Investigation Assistant that collects and analyzes digital evidence from multiple sources such as SMS, bank statements, server logs, emails, and screenshots. It automatically extracts entities, correlates events across time, location, and identity, and reconstructs them into an interactive visual crime scene.Every finding is traceable back to its original evidence, helping reduce AI hallucinations and improve investigation reliability. ARVIX detects anomalies such as impossible travel, suspicious transactions, and unusual login activity to generate investigation risk signals.",
        tools: ["Microsoft Copilot", "Microsoft Designer", "Power Automate"],
        members: ["ROSHAN", "SANJEEVI", "SAMINTHA NAVEEN", "NIRMAL HARIHARAN"],
        projectUrl: "https://ops-6h4a.onrender.com/" 
      },
      { 
        name: "Team SQUARE SQUAD", 
        position: "3rd", 
        department: "CSBS", 
        year: "2nd Year",
        projectTitle: "Smart Fraud Alert System",
        description: "Smart Fraud Alert System is a web-based platform designed to help users identify and understand potential online scams. It analyzes messages and digital communication to detect suspicious or high-risk content. The system provides alerts when potentially fraudulent activity is detected. It supports multiple communication platforms such as WhatsApp, Telegram, SMS, Gmail, Outlook, Instagram, and Facebook. The system classifies detected content into Safe, Suspicious, and High-Risk categories. It provides simple guidance to help users understand why a message may be risky. A security checklist helps users follow basic online safety practices. The system also provides chatbot-based guidance for common fraud-related situations. Users can view useful information and report suspicious incidents through the platform. The project focuses on Prevent, Detect, Guide, and Protect as its main objectives. Overall, it aims to improve digital awareness and help users stay safer from online fraud.",
        tools: ["Microsoft Copilot", "Microsoft Designer", "GitHub"],
        members: ["MALAIARASI G", "JANASHREE K R", "SHALINI M", "DIVYA BHARATHI N"],
        projectUrl: "https://smart-fraud-detection.vercel.app/" 
      }
    ]
  }
];
