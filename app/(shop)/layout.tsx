import { getSession } from "@/lib/auth";
import { ShopNav } from "@/components/shared/shop-nav";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  let user = null;
  if (session) {
    user = {
      name: "",
      role: session.role,
    };
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ShopNav user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
