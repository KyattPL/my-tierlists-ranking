import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kyatt's movie catalogue",
  description: "Kyatt's movie / tv-series catalogue",
};

export default function MovieCollectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
