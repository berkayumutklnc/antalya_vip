"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "tr" | "en" | "de" | "ru";
const LANGS: Lang[] = ["tr", "en", "de", "ru"];
type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = {
  tr: {
    "nav.reservations": "Rezervasyonlar",
    "nav.vehicles": "Araçlar",
    "nav.calendar": "Takvim",
    "dashboard.title": "Yönetim Paneli",
    "dashboard.subtitle": "Genel bakış ve hızlı erişim",
    "dashboard.openReservations": "Bekleyen rezervasyonlar",
    "dashboard.vehicles": "Kayıtlı araçlar",
    "dashboard.go": "Görüntüle",
    "common.search.placeholder": "Ara...",
    "common.loading": "Yükleniyor...",
    "common.csv.download": "CSV indir",
    "common.close": "Kapat",
    "common.cancel": "Vazgeç",
    "common.save": "Kaydet",
    "common.add": "Ekle",
    "common.update": "Güncelle",
    "common.delete": "Sil",
    "common.actions": "İşlemler",
    "common.none": "—",
    "common.createdAt": "Oluşturma",
    "common.error": "Hata",
    "common.data.notfound": "Kayıt bulunamadı.",

    "reservations.title": "Rezervasyonlar",
    "reservations.tabs.all": "Tümü",
    "reservations.tabs.pending": "Bekleyen",
    "reservations.tabs.confirmed": "Onaylı",
    "reservations.tabs.canceled": "İptal",
    "reservations.col.code": "Kod",
    "reservations.col.datetime": "Tarih/Saat",
    "reservations.col.route": "Rota",
    "reservations.col.customer": "Müşteri",
    "reservations.col.vehicle": "Araç",
    "reservations.col.status": "Durum",
    "reservations.col.actions": "İşlemler",
    "reservations.search.placeholder": "Ara: kod, isim, telefon...",
    "reservations.assign": "Araç Ata",
    "reservations.whatsapp": "WA Mesaj",
    "reservations.cancel.request": "İptal Talebi",
    "reservations.reason.view": "Sebebi Gör",
    "reservations.people.baby": "Kişi: {adults} • Bebek: {baby}",

    "vehicles.title": "Araçlar",
    "vehicles.new": "Yeni Araç",
    "vehicles.col.id": "ID",
    "vehicles.col.type": "Tip",
    "vehicles.col.plate": "Plaka",
    "vehicles.col.driver": "Sürücü",
    "vehicles.col.blocks": "Bloklar",
    "vehicles.block.delete": "Sil",
    "vehicles.form.id": "Araç ID (zorunlu, benzersiz)",
    "vehicles.form.type": "Tip",
    "vehicles.form.plate": "Plaka",
    "vehicles.form.driverName": "Sürücü Adı",
    "vehicles.form.driverPhone": "Sürücü Telefonu",
    "vehicles.form.capacity": "Kapasite",
    "vehicles.form.blockDate": "Blok Tarihi",
    "vehicles.form.blockStart": "Başlangıç",
    "vehicles.form.blockMinutes": "Süre (dk)",
    "vehicles.form.addBlock": "Blok Ekle",
    "vehicles.form.edit": "Aracı Düzenle",
    "vehicles.form.create": "Yeni Araç",
    "vehicles.none": "Araç yok.",

    "calendar.title": "Takvim",
    "calendar.dayView": "Günlük görünüm",
    "calendar.allVehicles": "Tüm Araçlar",
    "calendar.addBlock": "Blok Ekle",
    "calendar.remove": "Kaldır",
  },
  en: {
    "nav.reservations": "Reservations",
    "nav.vehicles": "Vehicles",
    "nav.calendar": "Calendar",
    "dashboard.title": "Admin Dashboard",
    "dashboard.subtitle": "Overview and quick access",
    "dashboard.openReservations": "Open reservations",
    "dashboard.vehicles": "Registered vehicles",
    "dashboard.go": "View",
    "common.search.placeholder": "Search...",
    "common.loading": "Loading...",
    "common.csv.download": "Export CSV",
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.add": "Add",
    "common.update": "Update",
    "common.delete": "Delete",
    "common.actions": "Actions",
    "common.none": "—",
    "common.createdAt": "Created",
    "common.error": "Error",
    "common.data.notfound": "No records found.",

    "reservations.title": "Reservations",
    "reservations.tabs.all": "All",
    "reservations.tabs.pending": "Pending",
    "reservations.tabs.confirmed": "Confirmed",
    "reservations.tabs.canceled": "Canceled",
    "reservations.col.code": "Code",
    "reservations.col.datetime": "Date/Time",
    "reservations.col.route": "Route",
    "reservations.col.customer": "Customer",
    "reservations.col.vehicle": "Vehicle",
    "reservations.col.status": "Status",
    "reservations.col.actions": "Actions",
    "reservations.search.placeholder": "Search: code, name, phone...",
    "reservations.assign": "Assign Vehicle",
    "reservations.whatsapp": "WA Message",
    "reservations.cancel.request": "Cancel Request",
    "reservations.reason.view": "View Reason",
    "reservations.people.baby": "Pax: {adults} • Baby: {baby}",

    "vehicles.title": "Vehicles",
    "vehicles.new": "New Vehicle",
    "vehicles.col.id": "ID",
    "vehicles.col.type": "Type",
    "vehicles.col.plate": "Plate",
    "vehicles.col.driver": "Driver",
    "vehicles.col.blocks": "Blocks",
    "vehicles.block.delete": "Delete",
    "vehicles.form.id": "Vehicle ID (required, unique)",
    "vehicles.form.type": "Type",
    "vehicles.form.plate": "Plate",
    "vehicles.form.driverName": "Driver Name",
    "vehicles.form.driverPhone": "Driver Phone",
    "vehicles.form.capacity": "Capacity",
    "vehicles.form.blockDate": "Block Date",
    "vehicles.form.blockStart": "Start",
    "vehicles.form.blockMinutes": "Duration (min)",
    "vehicles.form.addBlock": "Add Block",
    "vehicles.form.edit": "Edit Vehicle",
    "vehicles.form.create": "New Vehicle",
    "vehicles.none": "No vehicles.",

    "calendar.title": "Calendar",
    "calendar.dayView": "Day view",
    "calendar.allVehicles": "All Vehicles",
    "calendar.addBlock": "Add Block",
    "calendar.remove": "Remove",
  },
  de: {
    "nav.reservations": "Buchungen",
    "nav.vehicles": "Fahrzeuge",
    "nav.calendar": "Kalender",
    "dashboard.title": "Admin-Dashboard",
    "dashboard.subtitle": "Übersicht und Schnellzugriff",
    "dashboard.openReservations": "Offene Buchungen",
    "dashboard.vehicles": "Registrierte Fahrzeuge",
    "dashboard.go": "Anzeigen",
    "common.search.placeholder": "Suchen...",
    "common.loading": "Wird geladen...",
    "common.csv.download": "CSV exportieren",
    "common.close": "Schließen",
    "common.cancel": "Abbrechen",
    "common.save": "Speichern",
    "common.add": "Hinzufügen",
    "common.update": "Aktualisieren",
    "common.delete": "Löschen",
    "common.actions": "Aktionen",
    "common.none": "—",
    "common.createdAt": "Erstellt",
    "common.error": "Fehler",
    "common.data.notfound": "Keine Einträge gefunden.",

    "reservations.title": "Buchungen",
    "reservations.tabs.all": "Alle",
    "reservations.tabs.pending": "Offen",
    "reservations.tabs.confirmed": "Bestätigt",
    "reservations.tabs.canceled": "Storniert",
    "reservations.col.code": "Code",
    "reservations.col.datetime": "Datum/Uhrzeit",
    "reservations.col.route": "Route",
    "reservations.col.customer": "Kunde",
    "reservations.col.vehicle": "Fahrzeug",
    "reservations.col.status": "Status",
    "reservations.col.actions": "Aktionen",
    "reservations.search.placeholder": "Suche: Code, Name, Telefon...",
    "reservations.assign": "Fahrzeug zuweisen",
    "reservations.whatsapp": "WA Nachricht",
    "reservations.cancel.request": "Stornoanfrage",
    "reservations.reason.view": "Grund anzeigen",
    "reservations.people.baby": "Pers.: {adults} • Baby: {baby}",

    "vehicles.title": "Fahrzeuge",
    "vehicles.new": "Neues Fahrzeug",
    "vehicles.col.id": "ID",
    "vehicles.col.type": "Typ",
    "vehicles.col.plate": "Kennzeichen",
    "vehicles.col.driver": "Fahrer",
    "vehicles.col.blocks": "Sperren",
    "vehicles.block.delete": "Löschen",
    "vehicles.form.id": "Fahrzeug-ID (erforderlich, eindeutig)",
    "vehicles.form.type": "Typ",
    "vehicles.form.plate": "Kennzeichen",
    "vehicles.form.driverName": "Fahrername",
    "vehicles.form.driverPhone": "Fahrer Telefon",
    "vehicles.form.capacity": "Kapazität",
    "vehicles.form.blockDate": "Sperrdatum",
    "vehicles.form.blockStart": "Start",
    "vehicles.form.blockMinutes": "Dauer (Min.)",
    "vehicles.form.addBlock": "Sperre hinzufügen",
    "vehicles.form.edit": "Fahrzeug bearbeiten",
    "vehicles.form.create": "Neues Fahrzeug",
    "vehicles.none": "Keine Fahrzeuge.",

    "calendar.title": "Kalender",
    "calendar.dayView": "Tagesansicht",
    "calendar.allVehicles": "Alle Fahrzeuge",
    "calendar.addBlock": "Sperre hinzufügen",
    "calendar.remove": "Entfernen",
  },
  ru: {
    "nav.reservations": "Бронирования",
    "nav.vehicles": "Автомобили",
    "nav.calendar": "Календарь",
    "dashboard.title": "Панель управления",
    "dashboard.subtitle": "Обзор и быстрый доступ",
    "dashboard.openReservations": "Открытые бронирования",
    "dashboard.vehicles": "Зарегистрированные авто",
    "dashboard.go": "Просмотр",
    "common.search.placeholder": "Поиск...",
    "common.loading": "Загрузка...",
    "common.csv.download": "Экспорт CSV",
    "common.close": "Закрыть",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.add": "Добавить",
    "common.update": "Обновить",
    "common.delete": "Удалить",
    "common.actions": "Действия",
    "common.none": "—",
    "common.createdAt": "Создано",
    "common.error": "Ошибка",
    "common.data.notfound": "Ничего не найдено.",

    "reservations.title": "Бронирования",
    "reservations.tabs.all": "Все",
    "reservations.tabs.pending": "В ожидании",
    "reservations.tabs.confirmed": "Подтверждено",
    "reservations.tabs.canceled": "Отменено",
    "reservations.col.code": "Код",
    "reservations.col.datetime": "Дата/Время",
    "reservations.col.route": "Маршрут",
    "reservations.col.customer": "Клиент",
    "reservations.col.vehicle": "Авто",
    "reservations.col.status": "Статус",
    "reservations.col.actions": "Действия",
    "reservations.search.placeholder": "Поиск: код, имя, телефон...",
    "reservations.assign": "Назначить авто",
    "reservations.whatsapp": "WA",
    "reservations.cancel.request": "Запрос отмены",
    "reservations.reason.view": "Показать причину",
    "reservations.people.baby": "Пасс.: {adults} • Дет.: {baby}",

    "vehicles.title": "Автомобили",
    "vehicles.new": "Новое авто",
    "vehicles.col.id": "ID",
    "vehicles.col.type": "Тип",
    "vehicles.col.plate": "Номер",
    "vehicles.col.driver": "Водитель",
    "vehicles.col.blocks": "Блокировки",
    "vehicles.block.delete": "Удалить",
    "vehicles.form.id": "ID авто (обязательно, уникально)",
    "vehicles.form.type": "Тип",
    "vehicles.form.plate": "Номер",
    "vehicles.form.driverName": "Имя водителя",
    "vehicles.form.driverPhone": "Тел. водителя",
    "vehicles.form.capacity": "Вместимость",
    "vehicles.form.blockDate": "Дата блокировки",
    "vehicles.form.blockStart": "Начало",
    "vehicles.form.blockMinutes": "Длит. (мин)",
    "vehicles.form.addBlock": "Добавить блок",
    "vehicles.form.edit": "Редактировать авто",
    "vehicles.form.create": "Новое авто",
    "vehicles.none": "Нет авто.",

    "calendar.title": "Календарь",
    "calendar.dayView": "Дневной вид",
    "calendar.allVehicles": "Все авто",
    "calendar.addBlock": "Добавить блок",
    "calendar.remove": "Удалить",
  },
};

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
} | null>(null);

function format(msg: string, vars?: Record<string, string | number>) {
  if (!vars) return msg;
  return msg.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("lang_admin") ||
        document.cookie.match(/(?:^|; )lang_admin=([^;]+)/)?.[1]) as Lang | null;
      if (saved && LANGS.includes(saved)) setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lang_admin", lang);
      document.cookie = `lang_admin=${lang}; path=/; max-age=31536000`;
    } catch {}
  }, [lang]);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const d = dictionaries[lang] || dictionaries.tr;
      return format(d[key] ?? key, vars);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
