import {
  BrainCircuit,
  Check,
  ChevronRight,
  Cpu,
  Eye,
  Lightbulb,
  Rocket,
  School,
} from "lucide-react";
import Link from "next/link";

const Explore = [
  {
    title: "Technology",
    desc: "Deep dives into the latest tech stacks, frameworks, and tools shaping the industry.",
    icon: <Cpu size={24} />,
  },
  {
    title: "Tutorials",
    desc: "Step-by-step guides helping you build real projects from scratch.",
    icon: <School size={24} />,
  },
  {
    title: "Growth",
    desc: "Insights on career development, soft skills, and productivity.",
    icon: <BrainCircuit size={24} />,
  },
  {
    title: "Ideas",
    desc: "Thought experiments and essays on the future of digital life.",
    icon: <Lightbulb size={24} />,
  },
];

export default function Page() {
  return (
    <div className="bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 ">
        <div className="max-w-200 text-center flex flex-col items-center gap-6">
          <div
            className="size-24 rounded-full bg-cover bg-center shadow-lg ring-4 ring-white dark:ring-gray-800"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCapA3nrP3wWS9IJAwti2EtG16XsHR_rlXDOo9xrQuRIrsTYtb4Nh7chpkJdQuiMTlC8xri8nH9m_IHeiyuTsc_mmGNm1BgS86wuXdjFf9Ybbvvj3EI_W2MPATdEW4QfvRlzBLvgIv98mF9esnXW_oU0Hzcxj5dDxdL8chmih83nOGDA4UUVD-begbyx24MkP6XWHUoTGxwosTiEUs6T5RR0rUP4JhY47nxf-NtRTTp__ha7ikgkFadqE6LQCvX-BtEFSSuMo3peHY')",
            }}
          />

          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Our Story
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Exploring the intersection of code, creativity, and life. A journey
            into the future of technology, one line of code at a time.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full pb-20">
        <div className="w-full container px-6 flex flex-col gap-24">
          {/* Who We Are */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div
                className="w-full aspect-4/3 rounded-2xl bg-cover bg-center shadow-xl"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAj66vIF5mkoWBMyLKaf4_Z_6bP8i7qKAwO4316i5_2exaF09NcIK6yZ7_jpaWgX62bbICGlE9Q7jgOZCe5a8AXWh3xUqvQwIknMFNlPZ2X4raDcBS3f3sl2JRkWmLYn4GxZS1QpqrfMRM_Z0okcEbihq7n9uV1nxF_As_Sr_aeTgkv3__AzY7adacjqxJ9zp9eMfpFh9ihVscFpKYu4B4Ver55N9mrrPOCIoAsx2HPtnh60PoFmBz7OrjAWcbFnSEFuYISyefaeVM')",
                }}
              />
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <span className="text-primary text-xs font-bold uppercase">
                The Author
              </span>

              <h2 className="text-3xl font-bold">
                Who is behind the keyboard?
              </h2>

              <p className="text-primary dark:text-secondary text-lg">
                I am a passionate developer and writer dedicated to sharing
                knowledge. This blog documents my journey from novice to expert.
              </p>

              <p className="text-primary dark:text-secondary text-lg">
                I believe clean code, continuous learning, and community-driven
                growth can change careers and lives.
              </p>
            </div>
          </section>

          {/* What We Explore */}
          <section className="flex flex-col gap-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">What We Explore</h2>
              <p className="text-primary dark:text-secondary">
                Dive into a variety of topics designed to help you become a
                better developer and thinker.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {Explore.map((explore_, i) => (
                <div
                  key={i}
                  className=" p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  <div className="size-12 rounded-xl flex items-center justify-center text-primary">
                    {explore_.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{explore_.title}</h3>
                    <p className="text-sm text-primary dark:text-secondary leading-normal">
                      {explore_.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* <!-- Mission & Vision --> */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary text-white p-10 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"></div>
              <div className="relative z-10">
                <Rocket size={50} className="mb-5" />
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-white/90 leading-relaxed text-lg">
                  To empower readers by simplifying complex concepts and
                  fostering a habit of continuous learning. We aim to be the
                  bridge between confusion and clarity for developers worldwide.
                </p>
              </div>
            </div>
            <div className="dark:bg-[#1e2530] dark:text-primary p-10 rounded-3xl flex flex-col justify-between">
              <div>
                <Eye size={50} className="mb-5" />
                <h3 className="text-2xl font-bold  mb-4">Our Vision</h3>
                <p className="leading-relaxed text-lg">
                  Building a knowledge-driven community where creativity meets
                  logic. We envision a space where developers of all levels can
                  find inspiration and practical wisdom.
                </p>
              </div>
            </div>
          </section>

          {/* <!-- Why Trust This Blog --> */}
          <section className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Why Trust TechBlog?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl w-full">
              <div className="flex items-start gap-4">
                <div className="mt-1 size-6 rounded-full bg-green-100 dark:bg-green-900/20 p-1 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Check className="text-base font-bold" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Honest Content</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    No fluff. Just authentic experiences and unbiased reviews.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 size-6 rounded-full bg-green-100 dark:bg-green-900/20 p-1 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Check className="text-base font-bold" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Practical Tutorials</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Code you can actually copy, paste, and run in production.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 size-6 rounded-full bg-green-100 dark:bg-green-900/20 p-1 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Check className="text-base font-bold" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Beginner Friendly</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Complex topics broken down into simple, digestible English.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 size-6 rounded-full bg-green-100 dark:bg-green-900/20 p-1 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Check className="text-base font-bold" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Real World Experience</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Lessons learned from actual projects and failures.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* <!-- Call To Action --> */}
          <section className="w-full rounded-3xl py-12 text-center shadow-lg flex flex-col items-center gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Let’s Learn and Grow Together
              </h2>
              <p className="text-lg text-primary dark:text-secondary">
                Join the community and never miss an update. Whether you are
                here to learn or just to browse, I&#39;m glad you made it.
              </p>
            </div>
            <div className="flex flex-wrap flex-col md:flex-row justify-center gap-4 w-full">
              <Link href={'/blog'} className="flex items-center cursor-pointer justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl transition-colors min-w-40">
                <span>Read Blogs</span>
                <ChevronRight />
              </Link>
              <button className="flex items-center justify-center gap-2 cursor-pointer bg-[#f0f2f4] dark:bg-gray-700 text-[#111318] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 font-bold h-12 px-8 rounded-xl transition-colors min-w-40">
                <span>Subscribe</span>
              </button>
              <button className="flex items-center justify-center gap-2 font-semibold h-12 px-6 rounded-xl hover:bg-gray-500 hover:text-slate-900 dark:hover:bg-gray-300 cursor-pointer transition-colors">
                <span>Contact Us</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
