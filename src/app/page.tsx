import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <Image src="/icon.svg" alt="sukiverse" width={100} height={100} priority />
    </main>
  );
}
