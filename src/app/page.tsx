import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background-app">
      <div className="w-[39.3rem] h-[85.2rem] flex items-center justify-center border border-white rounded-2xl">
        <Image src="/icon.svg" alt="sukiverse" width={100} height={100} priority />
      </div>
    </main>
  );
}
