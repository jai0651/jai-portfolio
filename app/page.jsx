import Photo from "@/components/Photo";
import Social from "@/components/Social";
import Stats from "@/components/Stats";
import { Button } from "@/components/ui/button";
import { FiDownload } from "react-icons/fi";
import Link from "next/link";

export default function Home() {
  return (
    <section className="h-full">
      <div className="container mx-auto h-full">
        <div className="flex flex-col xl:flex-row items-center justify-between xl:pt-8 xl:pb-24">
          {/* {text} */}
          <div className="text-center xl:text-left order-2 xl:order-none">
            <span className="text-xl">Software Developer</span>
            <h1 className="h1 mb-6">
              Hello I'm <br />
              <span className="text-accent">Jai Shankar</span>
            </h1>
            <p className="max-w-[500px] mb-9 text-white/80">
              I am a passionate full-stack developer with expertise in React.js,
              Spring Boot, AWS, and AI-driven solutions.
            </p>
            {/* {btn and social handles} */}
            <div className="flex flex-col xl:flex-row items-center gap-8">
              <a
                href="/JaiShankar_cv.pdf"
                download="JaiShankar_CV.pdf"
                className="uppercase flex items-center gap-2 border border-accent bg-transparent text-accent hover:bg-accent hover:text-primary px-4 py-2 rounded-lg"
              >
                <span>Download CV</span>
                <FiDownload className="text-xl" />
              </a>
              <div className="mb-8 xl:mb-0">
                <Social
                  containerStyles="flex gap-6"
                  iconStyles="w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent
                text-base hover:bg-accent hover:text-primary hover:transition-all duration-500 "
                />
              </div>
            </div>
          </div>
          <div className="order-1 xl:order-none mb-8 xl:mb-0">
            <Photo />
          </div>
        </div>
      </div>
      <Stats />
    </section>
  );
}
