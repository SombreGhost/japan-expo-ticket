"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Calendar } from "lucide-react"
import { EVENT_INFO } from "@/lib/types"

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a1628] py-12 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/images/egghead-bg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-orbitron mb-2 text-xl font-black text-white">
              JAPAN <span className="text-[#c41e3a]">EXPO</span>
            </h3>
            <p className="text-sm font-semibold text-[#f0c040]">
              {EVENT_INFO.edition}
            </p>
            <p className="mt-2 text-sm text-white/60">{EVENT_INFO.organizer}</p>
          </div>

          {/* Event Info */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Informations</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#5ba3e0]" />
                {EVENT_INFO.date} {EVENT_INFO.time}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#5ba3e0]" />
                {EVENT_INFO.location}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#5ba3e0]" />
                {EVENT_INFO.phone}
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Navigation</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-white"
                >
                  Accueil
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/inscription"
                  className="transition-colors hover:text-white"
                >
                  Inscription
                </Link>
              </li> */}
              <li>
                <Link
                  href="/#tickets"
                  className="transition-colors hover:text-white"
                >
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Administration</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/scan"
                  className="transition-colors hover:text-white"
                >
                  Scanner QR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c41e3a]/50 to-transparent" />
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center text-sm text-white/40">
          <p>© 2025 Japan Expo ESP - {EVENT_INFO.organizer}. Tous droits réservés.</p>
          <p className="mt-1">
            One Piece © Eiichiro Oda / Shueisha / Toei Animation
          </p>
        </div>
      </div>
    </footer>
  )
}
