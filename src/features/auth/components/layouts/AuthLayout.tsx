import logo from "@/assets/icons/logo.svg";
import AuthSidebar from "../AuthsSidevar";

export default function AuthLayout() {
  return (
    <div className="flex">
      <AuthSidebar />

      <section className="flex flex-1 justify-center">
        <div className="flex w-[360px] flex-col justify-between">
          <div>
            <div className="mt-[72px] mb-10 flex flex-col">
              <div className="font-apple-semibold pt-5 text-2xl text-[#434343]">
                <img
                  src={logo}
                  alt="logo"
                  width={85}
                  height={20}
                  className="mb-5"
                />
                <p>쉽고 빠른</p>
                <p>와이즈온을 사용해보세요</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
