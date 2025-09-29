"use client";
import { useRouter } from "next/navigation";
import { LuArrowUpRight } from "react-icons/lu";
import Button from "./components/Button";
import Image from "next/image";
import PhotoGrid from "./components/PhotoGrid";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/camera");
  };

  return (
    <div className="p-10">
      <div className="h-dvh p-10 grid grid-rows-[auto_1fr_auto] place-items-center border-4 border-secondary-100 rounded-[80px]">
        {/* Main Title */}
        <h1 className="text-8xl text-secondary-200 mb-6 leading-tight text-center font-bold">
          نكمل بعضنا
          <br />
          <span className="font-semibold text-6xl ">
            خذ سيلفي و خلك جزء من اللوحة
          </span>
        </h1>

        {/* Main Image with Photo Overlay */}
        <div className="w-full relative">
          <Image
            src="/Logo_1.png"
            alt="Main Logo"
            width={1300}
            height={190}
            className="w-full h-auto overflow-hidden rounded-[80px]"
            priority
          />
          <PhotoGrid />
        </div>
        {/* Bottom Section */}
        <div className="w-full text-center my-8">
          <Button
            onClick={handleStart}
            variant="default"
            size="large"
            className="w-full flex items-center justify-center gap-2"
          >
            <LuArrowUpRight />
            ابدأ الآن
          </Button>
        </div>
      </div>
    </div>
  );
}
