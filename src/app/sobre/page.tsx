import React from "react";
import MaintenancePage from "@/components/MaintenancePage";

export const metadata = {
  title: "Sobre nós | Concurseiro Focado",
  description: "Conheça a história e o projeto prático por trás do blog Concurseiro Focado.",
};

export default function SobrePage() {
  return <MaintenancePage categoryName="Sobre nós" />;
}
