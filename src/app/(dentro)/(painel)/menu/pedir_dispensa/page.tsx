'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent, useContext } from "react";
import Swal from "sweetalert2";
import { AuthContext } from "@/app/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export type Leave = {
  id: number;
  motivo: string;
  inicio: string;
  fim: string;
  justificativo: string | null;
  status: "pendente" | "aprovada" | "rejeitada";
  admin_comentario: string | null;
  created_at: string;
  funcionario_nome: string;
};

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function DispensaFuncionario() {
  const { accessToken } = useContext(AuthContext);
  const [dispensa, setdispensa] = useState<Leave[]>([]);
  const [motivo, setmotivo] = useState("");
  const [inicio, setinicio] = useState("");
  const [fim, setfim] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;
    fetch("https://backend-django-2-7qpl.onrender.com/api/dispensa/my/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
     .then((j) => setdispensa(Array.isArray(j.message) ? j.message : j))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };
function calculateDays(start: string, end: string): number {
  const inicio = new Date(start);
  const fim = new Date(end);
  const diffTime = fim.getTime() - inicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  return isNaN(diffDays) ? 0 : diffDays;
}
useEffect(() => {
    if (!accessToken) {
      router.push('/logincomsenha') 
    }
  }, [accessToken, router])
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return Swal.fire("Erro", "Faça login primeiro", "error");
    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    if(inicioDate > fimDate) {
      return Swal.fire("Erro", "A data de início não pode ser posterior à data de término", "error");
    }
    const body = new FormData();
    body.append("motivo", motivo);
    body.append("inicio", inicio);
    body.append("fim", fim);
    if (file) {
      body.append("justificativo", file);
    }

    if (file) {
      Swal.fire({ title: 'Carregando PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    }
    const res = await fetch("https://fc46-102-218-85-18.ngrok-free.app/api/dispensa/create/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    });

    if (!res.ok) return Swal.fire("Erro", "Falha ao enviar pedido", "error");
    const json = await res.json();
    console.log(json);
    setdispensa((prev) => [json, ...prev]);
    setmotivo(""); setinicio(""); setfim(""); setFile(null);
    Swal.fire("Sucesso", "Pedido enviado!", "success");
  };
useEffect(() => {
    if (loading) {
      Swal.fire({
        title: 'Carregando Dispensas...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
    } else {
      Swal.close();
    }
  }, [loading]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meus Pedidos de Dispensa</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label>Motivo</label>
          <textarea
            value={motivo}
            onChange={(e) => setmotivo(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Data Início</label>
            <Input type="date" value={inicio} onChange={(e) => setinicio(e.target.value)} required />
          </div>
          <div>
            <label>Data Término</label>
            <Input type="date" value={fim} onChange={(e) => setfim(e.target.value)} required />
          </div>
        </div>
        <div>
          <label>Justificativa (PDF)</label>
          <Input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>
        <Button type="submit">Enviar Pedido</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Motivo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Comentário</TableHead>
            <TableHead>Arquivo</TableHead>
            <TableHead>Quem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dispensa.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.motivo}</TableCell>
              <TableCell><span className="text-sm text-black-800">
               {calculateDays(l.inicio, l.fim)} dias
              </span></TableCell>
              <TableCell>{l.status}</TableCell>
              <TableCell>{l.admin_comentario || "—"}</TableCell>
              <TableCell>
                {l.justificativo ? (
                  <a  href={`https://fc46-102-218-85-18.ngrok-free.app/api/media/justificativo/${l.justificativo?.split('/').pop()}`} target="_blank" rel="noopener noreferrer">Ver PDF</a>
                ) : "—"}
              </TableCell>
              <TableCell>{l.funcionario_nome}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
