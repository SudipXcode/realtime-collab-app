import type { Metadata } from "next";
import { googleSans } from "./font";
import "./globals.css";
import MobileGuard from "@/hooks/MobileGaurd";
import QueryProvider from "@/components/layout/QueryProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReduxProvider from "@/redux/ReduxProvider";
import DialogProvider from "@/components/ui/DialogProvider";
import MountedProvider from '@/components/layout/MountProvider'

export const metadata: Metadata = {
  title: "Taskpilot",
  description: "Taskpilot is the task management app for work and home. Organize team projects, meeting notes, and follow ups at the office, and keep family tasks, events, ...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${googleSans.className}  antialiased`}>
        <ReduxProvider>
          <QueryProvider>
            <DialogProvider />
            <MobileGuard >
              <MountedProvider>
                {children}
              </MountedProvider>
            </MobileGuard>
            <ToastContainer />
          </QueryProvider>

        </ReduxProvider>
      </body>
    </html>
  );
}
