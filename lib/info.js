import {
    FaHtml5,
    FaCss3,
    FaJs,
    FaReact,
    FaNodeJs,
    FaJava,
    FaDocker,
    FaAws,
    FaAndroid,
    FaPython,
  } from "react-icons/fa";
  
import { SiTailwindcss, SiNextdotjs, SiSpringboot, SiTensorflow, SiApachekafka, SiKubernetes, SiPostgresql, SiMongodb } from "react-icons/si";


export const services = [
    {
      num: "01",
      title: "Full-Stack Development",
      description: "Building scalable web applications using React.js, Next.js, and Spring Boot.",
      href: "",
    },
    {
      num: "02",
      title: "Backend Architecture",
      description: "Designing efficient and scalable backend systems using microservices, event-driven architecture, and cloud platforms.",
      href: "",
    },
    {
      num: "03",
      title: "AI-Powered Applications",
      description: "Developing AI-driven applications, including task automation and deep learning-based solutions.",
      href: "",
    },
    {
      num: "04",
      title: "DevOps & Cloud Solutions",
      description: "Deploying and managing applications on AWS, GCP, and optimizing CI/CD workflows.",
      href: "",
    },
  ];

export const about = {
    title: "About me",
    description: "Results-driven Software Engineer specializing in backend and frontend development, microservices architecture, and cloud technologies.",
    info: [
      {
        fieldName: "Name",
        fieldValue: "Jai Shankar",
      },
      {
        fieldName: "Email",
        fieldValue: "jaimauryatech@gmail.com",
      },
      {
        fieldName: "Freelance",
        fieldValue: "Available",
      },
      {
        fieldName: "Languages",
        fieldValue: "English, Hindi",
      },
      {
        fieldName: "Experience",
        fieldValue: "1+ years",
      },
    ],
  };
  
export const experience = {
    icon: "/assets/resume/badge.svg",
    title: "My experience",
    description: "Professional experience in backend, frontend, and cloud-based development.",
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
  
export const education = {
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
  
export const skills = {
    title: "My skills",
    description: "Technical expertise in backend, frontend, AI, and cloud technologies.",
    skillList: [
      {
        icon: <FaReact />,
        name: "React.js",
      },
      {
        icon: <FaJava />,
        name: "Java",
      },
      {
        icon: <SiNextdotjs />,
        name: "Next.js",
      },
      {
        icon: <SiSpringboot />,
        name: "Spring Boot",
      },
      {
        icon: <FaJs />,
        name: "JavaScript",
      },
      {
        icon: <FaNodeJs />,
        name: "Node.js",
      },
      {
        icon: <FaAws />,
        name: "AWS",
      },
      {
        icon: <FaDocker />,
        name: "Docker",
      },
      {
        icon: <SiMongodb />,
        name: "MongoDB",
      },
      {
        icon: <SiPostgresql />,
        name: "PostgreSQL",
      },
      {
        icon: <SiKubernetes />,
        name: "Kubernetes",
      },
      {
        icon: <SiApachekafka />,
        name: "Apache Kafka",
      },
      {
        icon: <SiTensorflow/>,
        name: "Machine Learning",
      },
    ],
  };


  export const projects = [
    {
      num: "01",
      category: "FullStack",
      title: "Bug Book (Social Platform for Book Enthusiasts)",
      description: "Developed an Instagram-like platform for book lovers with book recommendations, reviews, and collections.",
      stack: ["Next.js", "PostgreSQL"],
      image: "/assets/work/thumb1.png",
      live: "https://bug-book-ryuks-projects-91199312.vercel.app/login",
      github: "#",
    },
    {
      num: "02",
      category: "AI & Automation",
      title: "AI-Powered To-Do Application",
      description: "Built a Node.js-based to-do application with AI task automation, including smart prioritization and searches.",
      stack: ["Node.js", "AI Agents"],
      image: "/assets/work/thumb2.png",
      live: "#",
      github: "https://github.com/jai0651/Ai-Agents",
    },
    {
      num: "03",
      category: "DevOps & Tools",
      title: "Python GUI in Google Colab",
      description: "Created a tool enabling interactive GUI applications in Google Colab with VNC server and Chrome extension integration.",
      stack: ["Python", "Chrome Extension"],
      image: "/assets/work/thumb3.png",
      live: "#",
      github: "https://github.com/jai0651/Python-GUI-in-Google-Colab-with-VNC-Chrome-Extension",
    },
    {
      num: "04",
      category: "Deep Learning & Numerical Analysis",
      title: "Numerical Error Reduction with Deep Learning",
      description: "Enhanced low-fidelity model accuracy using differentiable physics and deep learning techniques.",
      stack: ["Deep Learning", "Differentiable Physics"],
      image: "/assets/work/thumb4.png",
      live: "#",
      github: "https://github.com/jai0651/Reducing-Numerical-errors-using-Deep-Learning",
    },
  ];