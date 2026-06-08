import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import InteractiveDots from "@/components/sections/InteractiveDots";


import OrganProfessor from "@/components/sections/OrganProfessor";
import AuthorComposer from "@/components/sections/AuthorComposer";
import GoodiesContact from "@/components/sections/GoodiesContact";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  return (
    <main>
      <LoadingScreen />
      <div className="flex flex-col w-full">
        <Hero />

        <Intro />
        <InteractiveDots />


        <OrganProfessor />
        <AuthorComposer />
        <GoodiesContact />
      </div>
    </main>
  );
}
