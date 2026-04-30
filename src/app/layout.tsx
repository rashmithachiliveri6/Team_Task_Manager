import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Task Manager",
  description: "Manage projects and tasks with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
