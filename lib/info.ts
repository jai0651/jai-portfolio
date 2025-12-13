import {
  FaReact,
  FaNodeJs,
  FaJava,
  FaDocker,
  FaAws,
  FaJs,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiSpringboot,
  SiTensorflow,
  SiApachekafka,
  SiKubernetes,
  SiPostgresql,
  SiMongodb,
} from "react-icons/si";
import { createElement } from "react";

export interface Service {
  num: string;
  title: string;
  description: string;
  href: string;
}

export interface AboutInfo {
  fieldName: string;
  fieldValue: string;
}

export interface About {
  title: string;
  description: string;
  info: AboutInfo[];
}

export interface ExperienceItem {
  company: string;
  position: string;
  location: string;
  duration: string;
}

export interface Experience {
  icon: string;
  title: string;
  description: string;
  items: ExperienceItem[];
}

export interface EducationItem {
  university: string;
  degree: string;
  major: string;
  duration: string;
}

export interface Education {
  icon: string;
  title: string;
  description: string;
  items: EducationItem[];
}

export interface Skill {
  icon: React.ReactElement;
  name: string;
}

export interface Skills {
  title: string;
  description: string;
  skillList: Skill[];
}

export interface Project {
  num: string;
  category: string;
  title: string;
  description: string;
  stack: string[];
  image: string;
  live: string;
  github: string;
}

export const services: Service[] = [
  {
    num: "01",
    title: "Full-Stack Development",
    description:
      "Building scalable web applications using React.js, Next.js, and Spring Boot.",
    href: "",
  },
  {
    num: "02",
    title: "Backend Architecture",
    description:
      "Designing efficient and scalable backend systems using microservices, event-driven architecture, and cloud platforms.",
    href: "",
  },
  {
    num: "03",
    title: "AI-Powered Applications",
    description:
      "Developing AI-driven applications, including task automation and deep learning-based solutions.",
    href: "",
  },
  {
    num: "04",
    title: "DevOps & Cloud Solutions",
    description:
      "Deploying and managing applications on AWS, GCP, and optimizing CI/CD workflows.",
    href: "",
  },
];

export const about: About = {
  title: "About me",
  description:
    "Results-driven Software Engineer specializing in backend and frontend development, microservices architecture, and cloud technologies.",
  info: [
    { fieldName: "Name", fieldValue: "Jai Shankar" },
    { fieldName: "Email", fieldValue: "jaimauryatech@gmail.com" },
    { fieldName: "Freelance", fieldValue: "Available" },
    { fieldName: "Languages", fieldValue: "English, Hindi" },
    { fieldName: "Experience", fieldValue: "1+ years" },
  ],
};

export const experience: Experience = {
  icon: "/assets/resume/badge.svg",
  title: "My experience",
  description:
    "Professional experience in backend, frontend, and cloud-based development.",
  items: [
    {
      company: "Swachh.io",
      position: "Software Development Intern",
      location: "New Delhi, India",
      duration: "May 2023 - July 2023",
    },
    {
      company: "2Sigma School",
      position: "Software Development Intern",
      location: "Santa Clara, CA, US (Remote)",
      duration: "March 2024 - May 2024",
    },
    {
      company: "Hyperbots Inc.",
      position: "Software Engineer I",
      location: "Bengaluru, India",
      duration: "June 2024 - Present",
    },
  ],
};

export const education: Education = {
  icon: "/assets/resume/cap.svg",
  title: "My Education",
  description: "Academic background in engineering and computational mechanics.",
  items: [
    {
      university: "Indian Institute of Technology Delhi (IIT Delhi)",
      degree: "B.Tech",
      major: "Engineering and Computational Mechanics",
      duration: "Nov 2020 - May 2024",
    },
  ],
};

export const skills: Skills = {
  title: "My skills",
  description: "Technical expertise in backend, frontend, AI, and cloud technologies.",
  skillList: [
    { icon: createElement(FaReact), name: "React.js" },
    { icon: createElement(FaJava), name: "Java" },
    { icon: createElement(SiNextdotjs), name: "Next.js" },
    { icon: createElement(SiSpringboot), name: "Spring Boot" },
    { icon: createElement(FaJs), name: "JavaScript" },
    { icon: createElement(FaNodeJs), name: "Node.js" },
    { icon: createElement(FaAws), name: "AWS" },
    { icon: createElement(FaDocker), name: "Docker" },
    { icon: createElement(SiMongodb), name: "MongoDB" },
    { icon: createElement(SiPostgresql), name: "PostgreSQL" },
    { icon: createElement(SiKubernetes), name: "Kubernetes" },
    { icon: createElement(SiApachekafka), name: "Apache Kafka" },
    { icon: createElement(SiTensorflow), name: "Machine Learning" },
  ],
};

export const projects: Project[] = [
  {
    num: "01",
    category: "FullStack",
    title: "Bug Book (Social Platform for Book Enthusiasts)",
    description:
      "Developed an Instagram-like platform for book lovers with book recommendations, reviews, and collections.",
    stack: ["Next.js", "PostgreSQL"],
    image: "/assets/work/thumb1.png",
    live: "https://bug-book-ryuks-projects-91199312.vercel.app/login",
    github: "#",
  },
  {
    num: "02",
    category: "AI & Automation",
    title: "AI-Powered To-Do Application",
    description:
      "Built a Node.js-based to-do application with AI task automation, including smart prioritization and searches.",
    stack: ["Node.js", "AI Agents"],
    image: "/assets/work/thumb2.png",
    live: "#",
    github: "https://github.com/jai0651/Ai-Agents",
  },
  {
    num: "03",
    category: "DevOps & Tools",
    title: "Python GUI in Google Colab",
    description:
      "Created a tool enabling interactive GUI applications in Google Colab with VNC server and Chrome extension integration.",
    stack: ["Python", "Chrome Extension"],
    image: "/assets/work/thumb3.png",
    live: "#",
    github:
      "https://github.com/jai0651/Python-GUI-in-Google-Colab-with-VNC-Chrome-Extension",
  },
  {
    num: "04",
    category: "Deep Learning & Numerical Analysis",
    title: "Numerical Error Reduction with Deep Learning",
    description:
      "Enhanced low-fidelity model accuracy using differentiable physics and deep learning techniques.",
    stack: ["Deep Learning", "Differentiable Physics"],
    image: "/assets/work/thumb4.png",
    live: "#",
    github:
      "https://github.com/jai0651/Reducing-Numerical-errors-using-Deep-Learning",
  },
];

