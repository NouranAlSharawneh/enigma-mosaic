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
    <div className="h-dvh bg-primary-300 p-8 flex flex-col">
      <div
        className="w-full h-full py-6 rounded-2xl flex flex-col"
        style={{
          backgroundImage: `url('/pattern_2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className=" p-6 flex flex-col gap-6">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center w-full h-full overflow-hidden">
            {/* Main Title */}
            <h1 className="text-8xl font-light text-primary-300 mb-6 leading-snug">
              معًا ضد ألزهايمر
              <br />
              <span className="font-semibold text-6xl">
                شارك صورتك لدعم مرضى ألزهايمر ونشر الوعي
              </span>
            </h1>

            {/* Main Image with Photo Overlay */}
            <div className="w-full relative">
              <Image
                src="/ribbon_1.png"
                alt="Awarness Ribbon"
                width={1300}
                height={190}
                className="w-full h-auto"
                priority
              />
              <PhotoGrid />
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Section */}
      <div className="w-full text-center my-8">
        <p className="font-medium text-2xl mb-4">
          التقط صورتك وكن جزءًا من لحظة تضامن
        </p>

        <Button
          onClick={handleStart}
          variant="secondary"
          size="large"
          className="w-full flex items-center justify-center gap-2"
        >
          <LuArrowUpRight />
          ابدأ الآن
        </Button>
      </div>
    </div>
  );
}
