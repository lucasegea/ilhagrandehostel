"use client";

import { useState, type FormEvent } from "react";
import s from "./conceito1.module.css";

/**
 * Client island: the booking form (mockup #reservar). 100% frontend (7.B) — on a
 * valid submit it opens a wa.me deep link prefilled with the guest's details; if a
 * field is empty it sends what is present. No backend. waNumber comes from the
 * block's aside CTA (data-driven, drop-in for the confirmed number).
 */
export default function ReservarForm({ waNumber }: { waNumber: string }) {
  const [shown, setShown] = useState(false);

  function fmt(d: string): string {
    // yyyy-mm-dd -> dd/mm
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    return m ? `${m[3]}/${m[2]}` : d;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const ci = String(data.get("checkin") || "");
    const co = String(data.get("checkout") || "");
    const hospedes = String(data.get("hospedes") || "");

    if (!ci || !co) {
      alert("Por favor, escolha as datas de check-in e check-out.");
      return;
    }
    if (new Date(co) <= new Date(ci)) {
      alert("A data de check-out precisa ser depois do check-in. Confira as datas, por favor.");
      return;
    }

    const parts = [
      "Olá! Gostaria de fazer uma reserva no Ilha Grande Hostel.",
      nome && `Nome: ${nome}`,
      `Check-in: ${fmt(ci)}`,
      `Check-out: ${fmt(co)}`,
      hospedes && `Hóspedes: ${hospedes}`,
    ].filter(Boolean);
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(parts.join("\n"))}`;

    setShown(true);
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className={s.formCard}>
      <form id="bookingForm" onSubmit={onSubmit} noValidate>
        <div className={s.field}>
          <label htmlFor="nome">Nome completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            autoComplete="name"
            placeholder="Como podemos te chamar?"
            required
          />
        </div>
        <div className={s.field}>
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="seu@email.com"
          />
        </div>
        <div className={s.fieldRow}>
          <div className={s.field}>
            <label htmlFor="checkin">Check-in</label>
            <input type="date" id="checkin" name="checkin" required />
          </div>
          <div className={s.field}>
            <label htmlFor="checkout">Check-out</label>
            <input type="date" id="checkout" name="checkout" required />
          </div>
        </div>
        <div className={s.field}>
          <label htmlFor="hospedes">Hóspedes</label>
          <select id="hospedes" name="hospedes" defaultValue="1">
            <option value="1">1 hóspede</option>
            <option value="2">2 hóspedes</option>
            <option value="3">3 hóspedes</option>
            <option value="4">4 hóspedes</option>
            <option value="5 ou mais">5 ou mais</option>
          </select>
        </div>
        <button type="submit" className={`${s.btn} ${s.btnPrimary}`} style={{ width: "100%" }}>
          Enviar pedido pelo WhatsApp
        </button>
        <div
          className={`${s.formMsg} ${s.formMsgSuccess} ${shown ? s.formMsgShow : ""}`}
          role="status"
          aria-live="polite"
        >
          ✓ Abrimos o WhatsApp com seu pedido. Se não abrir, fale com a gente pelo botão ao lado.
        </div>
      </form>
    </div>
  );
}
