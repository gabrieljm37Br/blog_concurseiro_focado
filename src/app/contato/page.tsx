import React from "react";
import MaintenancePage from "@/components/MaintenancePage";

export const metadata = {
  title: "Contato | Concurseiro Focado",
  description: "Fale com a equipe do Concurseiro Focado.",
};

export default function ContatoPage() {
  return <MaintenancePage categoryName="Contato" />;
}
