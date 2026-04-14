import React, { useState, useMemo, useEffect } from "react";
import { fetchProjects, upsertProject, updateProject as updateProjectRemote } from "./lib/projects";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area
} from "recharts";

/* ============================================================
   RelyAssets Italy — BESS Development Platform
   Data extracted from:
     - Italy_Pipeline_150126.xlsx (PIPELINE, per-project expense sheets, Taxonomy)
     - ITALY_PIPELINE_BUDGET_26.xlsx (Budget Italy 2026, Scoring Matrix, Input, PreAuct_Guarantee)
   ============================================================ */

// ---------- Brand ----------
const C = {
  navy: "#1a365d",
  navyDk: "#102a4c",
  navyLt: "#2c5282",
  green: "#38a169",
  greenLt: "#68d391",
  orange: "#dd6b20",
  red: "#c53030",
  slate: "#475569",
  border: "#e2e8f0",
  bg: "#f7fafc",
};

// ---------- Taxonomy ----------
const TAX = {
  opportunityStatus: ["Under negotiation", "Under exclusivity", "Land secured", "SPA signed", "DSA signed"],
  spv: ["Onda Energia", "Luce Energia Srl", "Nodo Energia", "TBD"],
  marketZone: ["CNOR", "NORD", "CSUD", "SUD", "CALA", "SARD"],
  projectTypology: ["Stand-Alone", "Hybrid pv", "Hybrid wind", "C&I with pv", "C&I stand-alone"],
  stmg: ["to be prepared", "prepared to be submitted", "submitted", "received", "accepted", "TBD"],
  landType: ["Agricultural", "Industrial"],
  landStatus: ["Under negotiation", "Exclusivity Letter signed", "Private Agreement signed", "Preliminary Agreement(s) Notarized", "TBD"],
  devMode: ["Internal dvpt", "Co-Development", "Purchase as is"],
  devStatus: [
    { v: 0.10, label: "Land Secured" },
    { v: 0.15, label: "STMG Requested" },
    { v: 0.20, label: "STMG Received" },
    { v: 0.225, label: "STMG Mod Request" },
    { v: 0.25, label: "STMG Received & Accepted" },
    { v: 0.30, label: "Notarial Deed" },
    { v: 0.35, label: "AU Submission" },
  ],
};

// ---------- Seed data (from the two Excel files) ----------
const SEED_PROJECTS = [
  {
    id: "galatone", name: "Galatone", status: "DSA signed", spv: "Luce Energia Srl",
    devStatus: 0.35, marketZone: "SUD", regione: "Puglia", provincia: "Lecce", comune: "Galatone",
    typology: "Stand-Alone", rtb: "2026 Q4", powerMw: 96, capacityH: 6, capacityMwh: 576,
    esVolt: 150, esDist: 0.75, stmg: "accepted", codPratica: null,
    stmgRequest: null, stmgReceived: null, stmgExpiration: null,
    connection: null, stmgAccVat: 0, connectionTotCost: null,
    landType: "Agricultural", ha: null, landStatus: "Preliminary Agreement(s) Notarized",
    loiSign: null, loiExp: null,
    devMode: "Co-Development", originator: "Raffaello", origFeePerMw: null, totOrigFee: 0,
    developer: "Raffaello Energy", devFee: 18000, totDevFee: 1728000,
    m1: null, m2: null, m3: null, m4: null, m5: null,
    comments: "meeting Friday 25 - calendar to be shared. Dataroom to be uploaded. AU doc submission on August 10th 2025",
    suspended: false, dropped: false,
  },
  {
    id: "latiano", name: "Latiano", status: "Under negotiation", spv: "Onda Energia",
    devStatus: 0.25, marketZone: "SUD", regione: "Puglia", provincia: "Brindisi", comune: "Latiano",
    typology: "Stand-Alone", rtb: "2027 Q2", powerMw: 500, capacityH: 4, capacityMwh: 2000,
    esVolt: 380, esDist: 0.7, stmg: "accepted", codPratica: null,
    landType: "Agricultural", ha: null, landStatus: "Private Agreement signed",
    devMode: "Purchase as is", originator: "SCM Ingegneria", origFeePerMw: 1500, totOrigFee: 750000,
    developer: "Internal", devFee: 1000, totDevFee: 500000,
    m1: 266000, m2: 266000, m3: 268000, m4: null, m5: null,
    comments: "Legal DD to be quoted. OPDE teaser shared.",
  },
  {
    id: "ariano", name: "Ariano Irpino", status: "Land secured", spv: "Onda Energia",
    devStatus: 0.20, marketZone: "CSUD", regione: "Campania", provincia: "Avellino", comune: "Ariano Irpino",
    typology: "Stand-Alone", rtb: "2027 Q1", powerMw: 96, capacityH: 8, capacityMwh: 768,
    esVolt: 150, esDist: 0.7, stmg: "received", codPratica: 202504522,
    stmgRequest: "2025-10-06", stmgReceived: "2025-11-10", stmgExpiration: "2026-04-14",
    connection: "36KV", stmgAccVat: 55594.81, connectionTotCost: 151898.4,
    landType: "Agricultural", ha: 17, landStatus: "Exclusivity Letter signed",
    devMode: "Internal dvpt", originator: "Internal", origFeePerMw: 0, totOrigFee: 0,
    developer: "Internal", devFee: 1000, totDevFee: 96000,
    comments: "STMG received 29/10/2025",
  },
  {
    id: "acquaviva2", name: "Aquaviva delle Fonti 2", status: "Land secured", spv: "Onda Energia",
    devStatus: 0.20, marketZone: "SUD", regione: "Puglia", provincia: "Bari", comune: "Aquaviva delle Fonti",
    typology: "Stand-Alone", rtb: "2027 Q2", powerMw: 10, capacityH: 8, capacityMwh: 80,
    esVolt: 150, esDist: 0.6, stmg: "received", codPratica: 202505890,
    stmgRequest: "2025-10-06", stmgReceived: "2025-12-19", stmgExpiration: null,
    stmgAccVat: 5072.76, connectionTotCost: 13860,
    landType: "Agricultural", landStatus: "Exclusivity Letter signed",
    loiSign: "2024-04-08", loiExp: "2026-04-02",
    devMode: "Internal dvpt", originator: "Fast Deals", origFeePerMw: 3000, totOrigFee: 30000,
    developer: "Internal", devFee: 1000,
    m1: 30, m2: 150,
    comments: "STMG submitted on August 1st (then +90 working days)",
  },
  {
    id: "acquaviva1", name: "Aquaviva delle Fonti 1", status: "Land secured", spv: "Onda Energia",
    devStatus: 0.20, marketZone: "SUD", regione: "Puglia", provincia: "Bari", comune: "Aquaviva delle Fonti",
    typology: "Stand-Alone", rtb: "2026 Q4", powerMw: 30, capacityH: 8, capacityMwh: 240,
    stmg: "received", codPratica: 202504773,
    stmgRequest: "2025-11-13", stmgReceived: "2025-11-26",
    connection: "36KV", stmgAccVat: 55594.81, connectionTotCost: 151898.4,
    landType: "Agricultural", landStatus: "Exclusivity Letter signed",
    loiSign: "2025-04-08", loiExp: "2026-04-05",
    devMode: "Internal dvpt", originator: "Fast Deals",
  },
  {
    id: "cerignola1", name: "Cerignola 1", status: "Land secured", spv: "Onda Energia",
    devStatus: 0.20, marketZone: "SUD", regione: "Puglia", provincia: "Foggia", comune: "Cerignola",
    typology: "Stand-Alone", rtb: "2026 Q4", powerMw: 50, capacityH: 4, capacityMwh: 200,
    esVolt: 150, esDist: 0.6, stmg: "received", codPratica: 202505917,
    stmgRequest: "2025-11-13", stmgReceived: "2025-12-17",
    connection: "36KV", stmgAccVat: 27999, connectionTotCost: 76500,
    landType: "Agricultural", ha: 4, landStatus: "Exclusivity Letter signed",
    loiSign: "2025-09-15", loiExp: "2026-06-15",
    devMode: "Internal dvpt", originator: "Fast Deals", origFeePerMw: 3000, totOrigFee: 150000,
    developer: "Internal", devFee: 1000, m1: 30, m2: 150,
    comments: "Exclusivity signed, STMG in preparation",
  },
  {
    id: "cerignola2", name: "Cerignola 2", status: "Land secured", spv: "Onda Energia",
    devStatus: 0.20, marketZone: "SUD", regione: "Puglia", provincia: "Foggia", comune: "Cerignola",
    typology: "Stand-Alone", rtb: "2027 Q2", powerMw: 96, capacityH: 4, capacityMwh: 384,
    esVolt: 150, esDist: 0.6, stmg: "received", codPratica: 202505919,
    stmgRequest: "2025-11-13", stmgReceived: "2025-12-17",
    connection: "36KV", stmgAccVat: 53758.08, connectionTotCost: 146880,
    landType: "Agricultural", ha: 1.7, landStatus: "Exclusivity Letter signed",
    loiSign: "2025-09-15", loiExp: "2026-06-15",
    devMode: "Internal dvpt", originator: "Fast Deals", origFeePerMw: 3000, totOrigFee: 288000,
    developer: "Internal", devFee: 1000, m1: 30, m2: 150,
    comments: "Exclusivity signed, STMG in preparation",
  },
  {
    id: "casamassima", name: "Casamassima", status: "Land secured", spv: "Onda Energia",
    devStatus: 0.20, marketZone: "SUD", regione: "Puglia", provincia: "Bari", comune: "Casamassima",
    typology: "Stand-Alone", rtb: "2026 Q4", powerMw: 10, capacityH: 4, capacityMwh: 40,
    esVolt: 150, esDist: 0.9, stmg: "received", codPratica: 202505916,
    stmgRequest: "2025-11-13", stmgReceived: "2025-12-19",
    connection: "36KV", stmgAccVat: 5072.76, connectionTotCost: 13860,
    landType: "Agricultural", ha: 1.2, landStatus: "Exclusivity Letter signed",
    loiSign: "2025-08-19", loiExp: "2026-05-19",
    devMode: "Internal dvpt", originator: "Fast Deals", origFeePerMw: 3000, totOrigFee: 30000,
    developer: "Internal", devFee: 1500,
  },
  {
    id: "andria", name: "Andria", status: "Land secured", spv: "Onda Energia",
    devStatus: 0.20, marketZone: "SUD", regione: "Puglia", provincia: "Bari", comune: "Andria",
    typology: "Stand-Alone", rtb: "2026 Q4", powerMw: 80, capacityH: 8, capacityMwh: 640,
    esVolt: 150, esDist: 0.5, stmg: "received", codPratica: 202505915,
    stmgRequest: "2025-11-13", stmgReceived: "2025-12-19",
    connection: "36KV", stmgAccVat: 44798.4, connectionTotCost: 122400,
    landType: "Agricultural", ha: 1.2, landStatus: "Exclusivity Letter signed",
    loiSign: "2025-10-09", loiExp: "2026-10-06",
    devMode: "Internal dvpt", originator: "Fast Deals", origFeePerMw: 3000, totOrigFee: 240000,
  },
  // Suspended project
  {
    id: "acquaviva10", name: "Acquaviva 10 (Suspended)", status: "Under negotiation", spv: "Onda Energia",
    devStatus: 0.10, marketZone: "SUD", regione: "Puglia", provincia: "Bari", comune: "Aquaviva delle Fonti",
    typology: "Stand-Alone", rtb: null, powerMw: 10, capacityH: 8, capacityMwh: 80,
    landType: "Agricultural", landStatus: "Under negotiation",
    suspended: true, comments: "PROJECT SUSPENDED",
  },
];

const DROPPED_NAMES = ["Aragona", "Pescopagano", "Caravaggio", "Rende RTB", "Taranto",
  "Pontirolo", "Borgosesia", "Fondi", "Ciminna", "Ragusa", "Priolo",
  "Chiaramonte Gulfi 1", "Chiaramonte Gulfi 2", "Pachino", "San Donaci", "Cuneo"];

// Per-project expenses (from the 9 project sheets in Pipeline file)
const SEED_EXPENSES = [
  { projectId: "andria", desc: "Terna Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-11-13" },
  { projectId: "andria", desc: "Daystar Connection Request", amount: 3000, vat: 0.22, total: 3660, date: "2025-11-13" },
  { projectId: "andria", desc: "Preliminary Analysis", amount: 150, vat: 0.22, total: 183, date: "2025-08-20" },
  { projectId: "andria", desc: "Land Scout Fee", amount: 2400, vat: 0.22, total: 2928, date: "2025-10-09" },

  { projectId: "acquaviva1", desc: "Terna Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-11-13" },
  { projectId: "acquaviva1", desc: "Ingesis Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-11-13" },
  { projectId: "acquaviva1", desc: "Preliminary Analysis", amount: 150, vat: 0.22, total: 183, date: "2025-08-20" },
  { projectId: "acquaviva1", desc: "Land Scout Fee", amount: 3000, vat: 0.22, total: 3660, date: "2025-04-08" },

  { projectId: "acquaviva2", desc: "Terna Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-10-06" },
  { projectId: "acquaviva2", desc: "Daystar Connection Request", amount: 3000, vat: 0.22, total: 3660, date: "2025-10-06" },
  { projectId: "acquaviva2", desc: "Preliminary Analysis", amount: 150, vat: 0.22, total: 183, date: "2025-08-20" },
  { projectId: "acquaviva2", desc: "Land Scout Fee", amount: 1500, vat: 0.22, total: 1830, date: "2025-08-29" },

  { projectId: "cerignola1", desc: "Preliminary Analysis", amount: 150, vat: 0.22, total: 183, date: "2025-08-20" },
  { projectId: "cerignola1", desc: "Land Scout Fee", amount: 1500, vat: 0.22, total: 1830, date: "2025-09-15" },
  { projectId: "cerignola1", desc: "Terna Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-11-13" },
  { projectId: "cerignola1", desc: "Daystar Connection Request", amount: 3000, vat: 0.22, total: 3660, date: "2025-11-13" },

  { projectId: "cerignola2", desc: "Preliminary Analysis", amount: 150, vat: 0.22, total: 183, date: "2025-08-20" },
  { projectId: "cerignola2", desc: "Terna Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-11-13" },
  { projectId: "cerignola2", desc: "Daystar Connection Request", amount: 3000, vat: 0.22, total: 3660, date: "2025-11-13" },

  { projectId: "galatone", desc: "Documentation Analysis", amount: 450, vat: 0.22, total: 549, date: "2025-09-01" },

  { projectId: "casamassima", desc: "Terna Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-11-13" },
  { projectId: "casamassima", desc: "Daystar Connection Request", amount: 3000, vat: 0.22, total: 3660, date: "2025-11-13" },

  { projectId: "ariano", desc: "Terna Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-10-06" },
  { projectId: "ariano", desc: "Ingesis Connection Request", amount: 2500, vat: 0.22, total: 3050, date: "2025-10-06" },
  { projectId: "ariano", desc: "Preliminary Analysis", amount: 150, vat: 0.22, total: 183, date: "2025-08-20" },
  { projectId: "ariano", desc: "Downpayment", amount: 5000, vat: 0, total: 5000, date: "2025-11-10" },

  { projectId: "latiano", desc: "Preliminary Analysis", amount: 150, vat: 0.22, total: 183, date: "2025-08-20" },
];

// 2026 monthly budget (from Budget Italy 2026 sheet)
const BUDGET_2026_ROWS = [
  { cat: "ADMIN", label: "Accountant (RelyAssets Italy)", months: [300,300,300,300,300,300,300,300,300,300,300,300], total: 3600 },
  { cat: "ADMIN", label: "Accountant (Luce Energia)", months: [300,300,300,300,300,300,300,300,300,300,300,300], total: 3600 },
  { cat: "ADMIN", label: "Accountant (Nodo Energia)", months: [300,300,300,300,300,300,300,300,300,300,300,300], total: 3600 },
  { cat: "ADMIN", label: "Accountant (Onda Energia)", months: [300,300,300,300,300,300,300,300,300,300,300,300], total: 3600 },
  { cat: "ADMIN", label: "Notary & Corporate Legal Expense", months: [0,0,2000,0,0,0,1000,0,0,0,0,0], total: 3000 },
  { cat: "ADMIN", label: "Bank fee", months: [70,70,70,70,70,70,70,70,70,70,70,70], total: 840 },
  { cat: "ADMIN", label: "Labour/Payroll Consultant", months: [0,200,200,200,200,200,200,200,200,200,200,200], total: 2200 },
  { cat: "OFFICE", label: "Office lease", months: [0,0,820.27,820.27,820.27,820.27,820.27,820.27,820.27,820.27,820.27,820.27], total: 8202.7 },
  { cat: "OFFICE", label: "Equipment (computers, etc)", months: [0,0,0,1300,0,0,0,0,0,0,0,0], total: 1300 },
  { cat: "OFFICE", label: "PecMail Accounts (5x)", months: [0,0,0,0,0,0,0,0,0,0,0,350], total: 350 },
  { cat: "TRAVEL", label: "Event/Conference", months: [0,0,1000,0,0,0,0,0,0,0,0,0], total: 1000 },
  { cat: "TRAVEL", label: "Travel Costs, Hotels & Restaurants", months: [0,750,1000,750,750,750,750,750,750,750,750,750], total: 8500 },
  { cat: "DEVEX", label: "Galatone 96", months: [3328.15,3466,4760.08,200,0,0,0,0,0,0,0,0], total: 11754.23 },
  { cat: "DEVEX", label: "Ariano Irpino 96", months: [0,15125,14768.6,108317.8,0,0,0,0,0,0,0,0], total: 138211.4 },
  { cat: "DEVEX", label: "Ariano Irpino 5", months: [0,13600,3050,0,0,7880,20430,19000,0,0,0,0], total: 63960 },
  { cat: "TRANSACT", label: "Lawyer", months: [0,0,0,7000,0,0,10000,0,0,0,0,0], total: 17000 },
  { cat: "TRANSACT", label: "Notary", months: [0,0,0,2000,0,0,2000,0,0,0,0,0], total: 4000 },
  { cat: "TRANSACT", label: "Market Consultant (MACSE ADVISORY)", months: [0,0,0,0,0,30000,0,0,0,0,0,0], total: 30000 },
  { cat: "TRANSACT", label: "Other consultants", months: [0,0,0,0,0,0,15000,0,0,0,0,0], total: 15000 },
  { cat: "TRANSACT", label: "Galatone Macse Guarantee", months: [0,0,0,0,0,0,1680000,0,0,0,0,0], total: 1680000 },
  { cat: "TRANSACT", label: "Ariano Macse Guarantee", months: [0,0,0,0,0,0,1680000,0,0,0,0,0], total: 1680000 },
];

// Project Scoring Matrix (selected rows mapped to active projects)
const SEED_SCORING = [
  { projectId: "cerignola1", name: "Cerignola 1", totScore: 41, mw: 50, landMode: "Land Purchase", landSize: 1.5, landCostPerMw: 4500, scoreLand: 5, gridCostPerMw: 1530, scoreGrid: 3, scoreKV: 5, scoreLandType: 3, scoreUrban: 4, kmPerMw: 25, scoreDist: 4, scoreSubstation: 3, scorePermitting: 3, scorePermitStatus: 0, scoreMacse: 3, scoreFlex: 3, scoreGeoDiv: 0, scoreNode: 5 },
  { projectId: "cerignola2", name: "Cerignola 2", totScore: 42, mw: 96, landMode: "Land Purchase", landSize: 3.3, landCostPerMw: 5156.25, scoreLand: 4, gridCostPerMw: 1530, scoreGrid: 3, scoreKV: 5, scoreLandType: 3, scoreUrban: 4, kmPerMw: 13.02, scoreDist: 4, scoreSubstation: 3, scorePermitting: 3, scorePermitStatus: 0, scoreMacse: 4, scoreFlex: 4, scoreGeoDiv: 0, scoreNode: 5 },
  { projectId: "acquaviva1", name: "Acquaviva 1", totScore: 38, mw: 30, landMode: "Land Purchase", landSize: 3.1, landCostPerMw: 10233.33, scoreLand: 3, gridCostPerMw: 5063.28, scoreGrid: 1, scoreKV: 5, scoreLandType: 3, scoreUrban: 4, kmPerMw: 16.67, scoreDist: 5, scoreSubstation: 1, scorePermitting: 3, scorePermitStatus: 0, scoreMacse: 4, scoreFlex: 4, scoreGeoDiv: 0, scoreNode: 5 },
  { projectId: "acquaviva2", name: "Acquaviva 2", totScore: 24, mw: 10, landMode: "Land Purchase", landSize: 1.7, landCostPerMw: 12000, scoreLand: 2, gridCostPerMw: 1386, scoreGrid: 3, scoreKV: 1, scoreLandType: 3, scoreUrban: 2, kmPerMw: 200, scoreDist: 1, scoreSubstation: 1, scorePermitting: 3, scorePermitStatus: 0, scoreMacse: 1, scoreFlex: 2, scoreGeoDiv: 0, scoreNode: 5 },
  { projectId: "andria", name: "Andria", totScore: 41, mw: 80, landMode: "Land Lease", landSize: 1.25, landCostPerMw: 6281.25, scoreLand: 4, gridCostPerMw: 1530, scoreGrid: 3, scoreKV: 5, scoreLandType: 3, scoreUrban: 4, kmPerMw: 8.75, scoreDist: 5, scoreSubstation: 2, scorePermitting: 3, scorePermitStatus: 0, scoreMacse: 4, scoreFlex: 3, scoreGeoDiv: 0, scoreNode: 5 },
  { projectId: "casamassima", name: "Casamassima", totScore: 31, mw: 10, landMode: "Land Purchase", landSize: 1.21, landCostPerMw: 7840, scoreLand: 3, gridCostPerMw: 1386, scoreGrid: 3, scoreKV: 5, scoreLandType: 3, scoreUrban: 4, kmPerMw: 150, scoreDist: 1, scoreSubstation: 1, scorePermitting: 3, scorePermitStatus: 0, scoreMacse: 1, scoreFlex: 2, scoreGeoDiv: 0, scoreNode: 5 },
  { projectId: "latiano", name: "Latiano", totScore: 42, mw: 300, landMode: "Land Purchase", landSize: 11, landCostPerMw: 1100, scoreLand: 5, gridCostPerMw: 366.67, scoreGrid: 5, scoreKV: 3, scoreLandType: 3, scoreUrban: 4, kmPerMw: 1, scoreDist: 5, scoreSubstation: 1, scorePermitting: 3, scorePermitStatus: 0, scoreMacse: 5, scoreFlex: 3, scoreGeoDiv: 0, scoreNode: 5 },
  { projectId: "ariano", name: "Ariano Irpino", totScore: 49, mw: 96, landMode: "Land Lease", landSize: 16.6, landCostPerMw: 28531.25, scoreLand: 1, gridCostPerMw: 1582.28, scoreGrid: 3, scoreKV: 5, scoreLandType: 3, scoreUrban: 4, kmPerMw: 5.21, scoreDist: 5, scoreSubstation: 4, scorePermitting: 3, scorePermitStatus: 3, scoreMacse: 5, scoreFlex: 5, scoreGeoDiv: 2, scoreNode: 5 },
  { projectId: "galatone", name: "Galatone", totScore: 45, mw: 96, landMode: "Land Purchase", landSize: 8.3, landCostPerMw: 6562.5, scoreLand: 4, gridCostPerMw: 1687.5, scoreGrid: 2, scoreKV: 3, scoreLandType: 3, scoreUrban: 4, kmPerMw: 5.21, scoreDist: 5, scoreSubstation: 1, scorePermitting: 3, scorePermitStatus: 5, scoreMacse: 5, scoreFlex: 5, scoreGeoDiv: 0, scoreNode: 5 },
];

const PRE_AUCTION = [
  { projectId: "galatone", name: "Galatone", power: 96, duration: 7, capacity: 672 },
  { projectId: "latiano", name: "Latiano", power: 400, duration: 7, capacity: 2800 },
  { projectId: "ariano", name: "Ariano Irpino", power: 96, duration: 7, capacity: 672 },
];

const DEFAULT_GLOBAL_INPUTS = { contingencies: 0.20, totalAmountPerMw: 750000, auIssuanceFee: 0.0003 };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ---------- Helpers ----------
const fmtEur = (n) => {
  if (n == null || n === "" || isNaN(n)) return "—";
  return "€ " + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const fmtEurD = (n) => {
  if (n == null || n === "" || isNaN(n)) return "—";
  return "€ " + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtMw = (n) => (n == null ? "—" : `${Number(n).toLocaleString("it-IT")} MW`);
const devPct = (v) => {
  // Map 0.10..0.35 → ~28%..100%
  if (v == null) return 0;
  return Math.min(100, Math.round((v / 0.35) * 100));
};
const devLabel = (v) => {
  if (v == null) return "—";
  const best = TAX.devStatus.reduce((a,b) => Math.abs(b.v - v) < Math.abs(a.v - v) ? b : a);
  return best.label;
};

// ---------- Small UI primitives ----------
const Badge = ({ children, color = "slate" }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
    navy: "bg-blue-50 text-blue-800 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${map[color]}`}>{children}</span>;
};

const statusColor = (s) => {
  if (!s) return "slate";
  const v = s.trim().toLowerCase();
  if (v === "dsa signed" || v === "spa signed") return "green";
  if (v === "land secured") return "navy";
  if (v === "under exclusivity") return "amber";
  if (v === "under negotiation") return "orange";
  return "slate";
};

const stmgColor = (s) => {
  if (!s) return "slate";
  const v = s.toLowerCase();
  if (v === "accepted") return "green";
  if (v === "received") return "navy";
  if (v === "submitted" || v === "prepared to be submitted") return "amber";
  if (v === "to be prepared") return "orange";
  return "slate";
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const KPI = ({ label, value, sub, accent }) => (
  <Card className="p-4">
    <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</div>
    <div className="text-2xl font-bold mt-1" style={{ color: accent || C.navy }}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </Card>
);

const ProgressBar = ({ value, color = C.green }) => (
  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
  </div>
);

// ---------- Sidebar ----------
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "pipeline", label: "Pipeline", icon: "⬢" },
  { id: "budget", label: "Budget & Finance", icon: "€" },
  { id: "scoring", label: "Scoring Matrix", icon: "★" },
  { id: "board", label: "Board Report", icon: "◆" },
  { id: "preauction", label: "Pre-Auction", icon: "⚡" },
];

function Sidebar({ current, setCurrent }) {
  return (
    <aside className="w-60 shrink-0 text-white flex flex-col" style={{ backgroundColor: C.navy }}>
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-sm uppercase tracking-widest opacity-70">RelyAssets</div>
        <div className="text-lg font-bold mt-0.5">BESS Italy Platform</div>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map((n) => {
          const active = current === n.id;
          return (
            <button key={n.id} onClick={() => setCurrent(n.id)}
              className={`w-full text-left px-5 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                active ? "bg-white/10 border-l-4 font-semibold" : "opacity-80 hover:bg-white/5 border-l-4 border-transparent"
              }`}
              style={active ? { borderLeftColor: C.green } : {}}>
              <span className="w-5 text-center opacity-90">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs opacity-60 border-t border-white/10">
        Head of Development — Italy<br/>Angelo Giordano
      </div>
    </aside>
  );
}

// ===================================================================
// DASHBOARD
// ===================================================================
function Dashboard({ projects, expenses, budget2026, onOpenProject }) {
  const active = projects.filter(p => !p.dropped && !p.suspended);
  const totalMw = active.reduce((a, p) => a + (p.powerMw || 0), 0);
  const totalMwh = active.reduce((a, p) => a + (p.capacityMwh || 0), 0);
  const budget26Total = budget2026.reduce((a, r) => a + r.total, 0);
  const spentToDate = expenses.reduce((a, e) => a + (e.total || 0), 0);
  const budgetUsed = (spentToDate / budget26Total) * 100;

  // Pipeline funnel
  const funnelBuckets = TAX.devStatus.map(s => ({
    stage: s.label,
    count: projects.filter(p => !p.dropped && !p.suspended && p.devStatus != null &&
      Math.abs(p.devStatus - s.v) < 0.013).length,
  }));

  // Budget vs actual per project
  const budgetByProj = {};
  budget2026.filter(r => r.cat === "DEVEX" || r.cat === "TRANSACT").forEach(r => {
    const key = r.label.toLowerCase();
    active.forEach(p => {
      if (key.includes(p.name.toLowerCase().split(" ")[0])) {
        budgetByProj[p.id] = (budgetByProj[p.id] || 0) + r.total;
      }
    });
  });
  const actualByProj = {};
  expenses.forEach(e => { actualByProj[e.projectId] = (actualByProj[e.projectId] || 0) + e.total; });
  const budgetVsActual = active.map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    planned: budgetByProj[p.id] || 0,
    actual: actualByProj[p.id] || 0,
  }));

  // Region distribution
  const byRegion = {};
  active.forEach(p => { byRegion[p.regione] = (byRegion[p.regione] || 0) + (p.powerMw || 0); });
  const regionData = Object.entries(byRegion).map(([name, value]) => ({ name, value }));
  const REGION_COLORS = [C.navy, C.green, C.orange, C.navyLt, C.greenLt];

  const suspendedCount = projects.filter(p => p.suspended).length;
  const archivedCount = projects.filter(p => p.dropped).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI label="Total Pipeline" value={fmtMw(totalMw)} sub={`${active.length} active projects`} />
        <KPI label="Capacity" value={`${totalMwh.toLocaleString("it-IT")} MWh`} sub="nominal energy" />
        <KPI label="2026 Budget" value={fmtEur(budget26Total)} sub="planned expenses" />
        <KPI label="Spent to Date" value={fmtEur(spentToDate)} sub="across all projects" accent={C.orange} />
        <KPI label="Budget Used" value={`${budgetUsed.toFixed(2)}%`} sub="of 2026 plan"
             accent={budgetUsed > 80 ? C.red : C.green} />
      </div>
      {(suspendedCount > 0 || archivedCount > 0) && (
        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          Totals above exclude <b>{suspendedCount}</b> suspended and <b>{archivedCount}</b> archived project{(suspendedCount+archivedCount) !== 1 ? "s" : ""}.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold" style={{ color: C.navy }}>Budget vs Actual per Project</div>
            <div className="text-xs text-slate-500">2026 planned (navy) vs booked expenses (orange)</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={budgetVsActual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtEur(v)} />
              <Legend />
              <Bar dataKey="planned" fill={C.navy} name="Planned 2026" radius={[4,4,0,0]} />
              <Bar dataKey="actual" fill={C.orange} name="Actual" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="font-semibold mb-3" style={{ color: C.navy }}>MW by Region</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {regionData.map((_, i) => <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v} MW`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {regionData.map((r, i) => (
              <div key={r.name} className="flex items-center justify-between text-sm">
                <span><span className="inline-block w-3 h-3 rounded mr-2" style={{ backgroundColor: REGION_COLORS[i] }}/>{r.name}</span>
                <span className="font-medium">{r.value} MW</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="font-semibold mb-3" style={{ color: C.navy }}>Pipeline Funnel — Development Stage</div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {funnelBuckets.map((b, i) => (
            <div key={b.stage} className="text-center p-3 rounded-lg border border-slate-200" style={{
              background: `linear-gradient(135deg, ${C.navy}${Math.round(10 + i*12).toString(16)} 0%, white 100%)`
            }}>
              <div className="text-2xl font-bold" style={{ color: C.navy }}>{b.count}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-600 mt-1 leading-tight">{b.stage}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold" style={{ color: C.navy }}>Active Projects — Snapshot</div>
          <div className="text-xs text-slate-500">Click a project to open detail</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500 border-b">
              <tr><th className="text-left py-2">Project</th><th className="text-left">Status</th><th className="text-right">MW</th>
              <th className="text-right">MWh</th><th className="text-left">STMG</th><th className="text-left">RTB</th>
              <th className="text-left w-40">Development</th></tr>
            </thead>
            <tbody>
              {active.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer"
                    onClick={() => onOpenProject(p.id)}>
                  <td className="py-2 font-medium" style={{ color: C.navy }}>{p.name}</td>
                  <td><Badge color={statusColor(p.status)}>{p.status}</Badge></td>
                  <td className="text-right">{p.powerMw}</td>
                  <td className="text-right">{p.capacityMwh}</td>
                  <td><Badge color={stmgColor(p.stmg)}>{p.stmg || "—"}</Badge></td>
                  <td>{p.rtb || "—"}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={devPct(p.devStatus)} />
                      <span className="text-xs text-slate-500 w-10 text-right">{devPct(p.devStatus)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ===================================================================
// PIPELINE
// ===================================================================
function Pipeline({ projects, onOpenProject, onAddProject, onRestore, onSuspend, onResume, onArchive }) {
  const [filters, setFilters] = useState({ status: "", regione: "", spv: "", typology: "", mode: "active" });
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const regioni = Array.from(new Set(projects.map(p => p.regione).filter(Boolean)));

  const filtered = projects
    .filter(p => {
      if (filters.mode === "active" && (p.dropped || p.suspended)) return false;
      if (filters.mode === "suspended" && !p.suspended) return false;
      if (filters.mode === "dropped" && !p.dropped) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.regione && p.regione !== filters.regione) return false;
      if (filters.spv && p.spv !== filters.spv) return false;
      if (filters.typology && p.typology !== filters.typology) return false;
      return true;
    })
    .sort((a, b) => {
      const A = a[sortBy], B = b[sortBy];
      if (A == null) return 1; if (B == null) return -1;
      const cmp = typeof A === "string" ? A.localeCompare(B) : A - B;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortH = ({ k, children, right }) => (
    <th className={`py-2 cursor-pointer select-none ${right ? "text-right" : "text-left"}`}
        onClick={() => { if (sortBy === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(k); setSortDir("asc"); } }}>
      {children}{sortBy === k ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 rounded-lg overflow-hidden border border-slate-200">
            {[
              {k: "active", label: "Active"},
              {k: "suspended", label: "Suspended"},
              {k: "dropped", label: "Archive"},
            ].map(m => (
              <button key={m.k} onClick={() => setFilters(f => ({...f, mode: m.k}))}
                className={`px-3 py-1.5 text-xs uppercase tracking-wide ${filters.mode === m.k ? "text-white" : "text-slate-600"}`}
                style={filters.mode === m.k ? { backgroundColor: C.navy } : {}}>{m.label}</button>
            ))}
          </div>
          <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                  value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}>
            <option value="">All statuses</option>
            {TAX.opportunityStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                  value={filters.regione} onChange={e => setFilters(f => ({...f, regione: e.target.value}))}>
            <option value="">All regions</option>
            {regioni.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                  value={filters.spv} onChange={e => setFilters(f => ({...f, spv: e.target.value}))}>
            <option value="">All SPVs</option>
            {TAX.spv.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                  value={filters.typology} onChange={e => setFilters(f => ({...f, typology: e.target.value}))}>
            <option value="">All typologies</option>
            {TAX.projectTypology.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="ml-auto text-sm text-slate-500">{filtered.length} projects</div>
          <button onClick={onAddProject} className="px-3 py-1.5 text-sm rounded-lg text-white"
                  style={{ backgroundColor: C.green }}>+ New project</button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500 border-b bg-slate-50">
              <tr>
                <SortH k="name">Project</SortH>
                <SortH k="status">Status</SortH>
                <SortH k="spv">SPV</SortH>
                <SortH k="regione">Region</SortH>
                <SortH k="comune">Comune</SortH>
                <SortH k="powerMw" right>MW</SortH>
                <SortH k="capacityH" right>H</SortH>
                <SortH k="capacityMwh" right>MWh</SortH>
                <SortH k="stmg">STMG</SortH>
                <SortH k="rtb">RTB</SortH>
                <SortH k="devStatus">Development</SortH>
                <th className="text-center py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium cursor-pointer" style={{ color: C.navy }} onClick={() => onOpenProject(p.id)}>
                    {p.name}{p.suspended && <span className="ml-2"><Badge color="orange">SUSPENDED</Badge></span>}
                    {p.dropped && <span className="ml-2"><Badge color="red">ARCHIVED</Badge></span>}
                  </td>
                  <td onClick={() => onOpenProject(p.id)} className="cursor-pointer"><Badge color={statusColor(p.status)}>{p.status || "—"}</Badge></td>
                  <td onClick={() => onOpenProject(p.id)} className="cursor-pointer">{p.spv || "—"}</td>
                  <td onClick={() => onOpenProject(p.id)} className="cursor-pointer">{p.regione || "—"}</td>
                  <td onClick={() => onOpenProject(p.id)} className="cursor-pointer">{p.comune || "—"}</td>
                  <td className="text-right cursor-pointer" onClick={() => onOpenProject(p.id)}>{p.powerMw ?? "—"}</td>
                  <td className="text-right cursor-pointer" onClick={() => onOpenProject(p.id)}>{p.capacityH ?? "—"}</td>
                  <td className="text-right cursor-pointer" onClick={() => onOpenProject(p.id)}>{p.capacityMwh ?? "—"}</td>
                  <td onClick={() => onOpenProject(p.id)} className="cursor-pointer"><Badge color={stmgColor(p.stmg)}>{p.stmg || "—"}</Badge></td>
                  <td onClick={() => onOpenProject(p.id)} className="cursor-pointer">{p.rtb || "—"}</td>
                  <td className="w-48 cursor-pointer" onClick={() => onOpenProject(p.id)}>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={devPct(p.devStatus)} />
                      <span className="text-xs text-slate-500 w-24 text-right truncate">{devLabel(p.devStatus)}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1 text-center whitespace-nowrap">
                    {!p.dropped && !p.suspended && (
                      <>
                        <button title="Suspend" onClick={(e) => { e.stopPropagation(); if (confirm(`Suspend "${p.name}"?`)) onSuspend(p.id); }}
                                className="text-orange-600 hover:bg-orange-50 rounded px-1.5 py-1 text-xs">⏸</button>
                        <button title="Archive (Drop)" onClick={(e) => { e.stopPropagation(); if (confirm(`Archive "${p.name}"?`)) onArchive(p.id); }}
                                className="text-red-600 hover:bg-red-50 rounded px-1.5 py-1 text-xs ml-1">✕</button>
                      </>
                    )}
                    {p.suspended && (
                      <button title="Resume" onClick={(e) => { e.stopPropagation(); onResume(p.id); }}
                              className="text-green-600 hover:bg-green-50 rounded px-2 py-1 text-xs">▶ Resume</button>
                    )}
                    {p.dropped && (
                      <button title="Restore from Archive" onClick={(e) => { e.stopPropagation(); onRestore(p.id); }}
                              className="text-green-600 hover:bg-green-50 rounded px-2 py-1 text-xs border border-green-200">↺ Restore</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {filters.mode === "suspended" && (
        <div className="text-xs text-slate-500 px-2">Suspended projects remain visible in the pipeline but are excluded from Dashboard / Board totals (MW, MWh, project count).</div>
      )}
      {filters.mode === "dropped" && (
        <div className="text-xs text-slate-500 px-2">Archived projects are removed from the active pipeline. Click <b>Restore</b> to bring a project back to active.</div>
      )}
    </div>
  );
}

// ---------- Project detail modal ----------
function ProjectDetail({ project, expenses, onClose, onEdit, onAddExpense }) {
  if (!project) return null;
  const projExp = expenses.filter(e => e.projectId === project.id);
  const totSpent = projExp.reduce((a, e) => a + (e.total || 0), 0);

  const row = (k, v) => (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500">{k}</span><span className="font-medium text-right">{v ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">{project.spv}</div>
            <div className="text-2xl font-bold flex items-center gap-2" style={{ color: C.navy }}>
              {project.name}
              {project.suspended && <Badge color="orange">SUSPENDED</Badge>}
              {project.dropped && <Badge color="red">ARCHIVED</Badge>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={() => onEdit(project)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200">Edit</button>
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg text-white" style={{ backgroundColor: C.navy }}>Close</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Opportunity</div>
            {row("Status", <Badge color={statusColor(project.status)}>{project.status}</Badge>)}
            {row("Typology", project.typology)}
            {row("Development mode", project.devMode)}
            {row("Development stage", <span>{devLabel(project.devStatus)} <span className="text-slate-400">({devPct(project.devStatus)}%)</span></span>)}
            {row("Estimated RTB", project.rtb)}
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Location & Size</div>
            {row("Market Zone", project.marketZone)}
            {row("Region", project.regione)}
            {row("Province", project.provincia)}
            {row("Comune", project.comune)}
            {row("Power", fmtMw(project.powerMw))}
            {row("Capacity", project.capacityMwh != null ? `${project.capacityMwh} MWh (${project.capacityH}h)` : "—")}
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Grid & STMG</div>
            {row("Substation voltage", project.esVolt ? `${project.esVolt} kV` : null)}
            {row("Distance", project.esDist != null ? `${project.esDist} km` : null)}
            {row("STMG", <Badge color={stmgColor(project.stmg)}>{project.stmg}</Badge>)}
            {row("COD Pratica", project.codPratica)}
            {row("Request / Received", project.stmgRequest || project.stmgReceived ? `${project.stmgRequest || "—"} / ${project.stmgReceived || "—"}` : null)}
            {row("Connection total cost", fmtEur(project.connectionTotCost))}
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Land</div>
            {row("Land type", project.landType)}
            {row("Hectares", project.ha)}
            {row("Land status", project.landStatus)}
            {row("LOI signed", project.loiSign)}
            {row("LOI expiration", project.loiExp)}
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Development & Fees</div>
            {row("Originator", project.originator)}
            {row("Origination fee €/MW", fmtEur(project.origFeePerMw))}
            {row("Tot Origination", fmtEur(project.totOrigFee))}
            {row("Developer", project.developer)}
            {row("Dev fee €/MW", fmtEur(project.devFee))}
            {row("Tot Dev fee", fmtEur(project.totDevFee))}
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Milestones (M1…M5)</div>
            {row("M1 (Land)", fmtEur(project.m1))}
            {row("M2 (Land+STMG)", fmtEur(project.m2))}
            {row("M3", fmtEur(project.m3))}
            {row("M4 (RTB)", fmtEur(project.m4))}
            {row("M5 (COD)", fmtEur(project.m5))}
          </Card>

          <Card className="p-4 md:col-span-3">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs uppercase tracking-wider text-slate-500">Expenses booked — {fmtEurD(totSpent)} total</div>
              <button onClick={() => onAddExpense(project.id)} className="px-3 py-1 text-xs rounded-lg text-white" style={{ backgroundColor: C.green }}>+ Add expense</button>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500 border-b">
                <tr><th className="text-left py-2">Description</th><th className="text-left">Date</th>
                <th className="text-right">Net €</th><th className="text-right">VAT</th><th className="text-right">Total €</th></tr>
              </thead>
              <tbody>
                {projExp.map((e, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5">{e.desc}</td>
                    <td>{e.date}</td>
                    <td className="text-right">{fmtEurD(e.amount)}</td>
                    <td className="text-right">{(e.vat*100).toFixed(0)}%</td>
                    <td className="text-right font-medium">{fmtEurD(e.total)}</td>
                  </tr>
                ))}
                {projExp.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-slate-400">No expenses booked yet.</td></tr>}
              </tbody>
            </table>
          </Card>

          {project.comments && (
            <Card className="p-4 md:col-span-3">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Notes</div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{project.comments}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Edit project modal ----------
function EditProjectModal({ project, onClose, onSave }) {
  const [f, setF] = useState(project);
  if (!project) return null;
  const upd = (k, v) => setF(s => ({...s, [k]: v}));
  const Field = ({ label, k, type = "text", opts }) => (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      {opts ? (
        <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" value={f[k] ?? ""} onChange={e => upd(k, e.target.value)}>
          <option value="">—</option>{opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
               value={f[k] ?? ""} onChange={e => upd(k, type === "number" ? Number(e.target.value) : e.target.value)} />
      )}
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex justify-between">
          <div className="text-xl font-bold" style={{ color: C.navy }}>{project.id ? "Edit" : "New"} project</div>
          <button onClick={onClose} className="text-slate-500">✕</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3">
          <div className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Lifecycle state</label>
            <div className="mt-2 flex gap-2">
              {[
                { v: "active",    label: "Active",    desc: "Counted in totals",            color: C.green  },
                { v: "suspended", label: "Suspended", desc: "Visible, not counted",         color: C.orange },
                { v: "dropped",   label: "Archived",  desc: "Removed from active pipeline", color: C.red    },
              ].map(opt => {
                const current = f.dropped ? "dropped" : f.suspended ? "suspended" : "active";
                const selected = current === opt.v;
                return (
                  <button key={opt.v} type="button"
                    onClick={() => setF(s => ({
                      ...s,
                      suspended: opt.v === "suspended",
                      dropped: opt.v === "dropped",
                    }))}
                    className={`flex-1 text-left px-3 py-2 rounded-lg border-2 transition-colors ${selected ? "bg-white" : "bg-white/40 border-transparent hover:bg-white"}`}
                    style={selected ? { borderColor: opt.color } : {}}>
                    <div className="text-sm font-semibold" style={{ color: selected ? opt.color : "#475569" }}>{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Project Name" k="name" />
          <Field label="Opportunity Status" k="status" opts={TAX.opportunityStatus} />
          <Field label="SPV" k="spv" opts={TAX.spv} />
          <Field label="Market Zone" k="marketZone" opts={TAX.marketZone} />
          <Field label="Region" k="regione" />
          <Field label="Province" k="provincia" />
          <Field label="Comune" k="comune" />
          <Field label="Typology" k="typology" opts={TAX.projectTypology} />
          <Field label="Power (MW)" k="powerMw" type="number" />
          <Field label="Hours" k="capacityH" type="number" />
          <Field label="Capacity (MWh)" k="capacityMwh" type="number" />
          <Field label="Estimated RTB" k="rtb" />
          <Field label="STMG status" k="stmg" opts={TAX.stmg} />
          <Field label="Land Type" k="landType" opts={TAX.landType} />
          <Field label="Land Status" k="landStatus" opts={TAX.landStatus} />
          <Field label="Development Mode" k="devMode" opts={TAX.devMode} />
          <div className="col-span-2">
            <label className="text-xs text-slate-500">Comments</label>
            <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                      value={f.comments ?? ""} onChange={e => upd("comments", e.target.value)} />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200">Cancel</button>
          <button onClick={() => onSave(f)} className="px-3 py-1.5 text-sm rounded-lg text-white" style={{ backgroundColor: C.green }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Add expense modal ----------
function AddExpenseModal({ projectId, onClose, onSave }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [vat, setVat] = useState(0.22);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  if (!projectId) return null;
  const total = amount * (1 + vat);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b"><div className="text-lg font-bold" style={{ color: C.navy }}>Add expense</div></div>
        <div className="p-6 space-y-3">
          <div><label className="text-xs text-slate-500">Description</label>
            <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div><label className="text-xs text-slate-500">Date</label>
            <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-slate-500">Net €</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={amount} onChange={e => setAmount(Number(e.target.value))} /></div>
            <div><label className="text-xs text-slate-500">VAT</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={vat} onChange={e => setVat(Number(e.target.value))}>
                <option value={0}>0%</option><option value={0.04}>4%</option><option value={0.10}>10%</option><option value={0.22}>22%</option>
              </select></div>
            <div><label className="text-xs text-slate-500">Total €</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm bg-slate-50" value={fmtEurD(total)} disabled /></div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border">Cancel</button>
          <button onClick={() => onSave({ projectId, desc, amount, vat, total, date })}
                  className="px-3 py-1.5 text-sm rounded-lg text-white" style={{ backgroundColor: C.green }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// BUDGET & FINANCE
// ===================================================================
function BudgetFinance({ projects, expenses, budget2026, onAddExpense }) {
  const monthlyTotals = useMemo(() => {
    return MONTHS.map((m, i) => ({
      month: m,
      planned: budget2026.reduce((a, r) => a + (r.months[i] || 0), 0),
    }));
  }, [budget2026]);

  // cumulative
  let cum = 0;
  const cumulative = monthlyTotals.map(d => { cum += d.planned; return { ...d, cumulative: cum }; });

  // actual expenses monthly (2025 + 2026)
  const actualMonthly = {};
  expenses.forEach(e => {
    if (!e.date) return;
    const key = e.date.slice(0, 7);
    actualMonthly[key] = (actualMonthly[key] || 0) + e.total;
  });

  const byCategory = useMemo(() => {
    const cats = {};
    budget2026.forEach(r => { cats[r.cat] = (cats[r.cat] || 0) + r.total; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [budget2026]);

  const active = projects.filter(p => !p.dropped);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="font-semibold mb-3" style={{ color: C.navy }}>2026 Cumulative Budget Plan</div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={cumulative}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtEur(v)} />
              <Legend />
              <Bar dataKey="planned" fill={C.navy} name="Monthly" radius={[4,4,0,0]} />
              <Line dataKey="cumulative" stroke={C.orange} name="Cumulative" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="font-semibold mb-3" style={{ color: C.navy }}>2026 by Category</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {byCategory.map((_, i) => <Cell key={i} fill={[C.navy, C.green, C.orange, C.navyLt, C.greenLt][i % 5]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtEur(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <div className="font-semibold mb-3" style={{ color: C.navy }}>2026 Budget — Monthly Detail</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b bg-slate-50">
              <tr>
                <th className="text-left py-2 px-2">Category</th>
                <th className="text-left px-2">Line item</th>
                {MONTHS.map(m => <th key={m} className="text-right px-1">{m}</th>)}
                <th className="text-right px-2 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {budget2026.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-1.5 px-2"><Badge color="slate">{r.cat}</Badge></td>
                  <td className="px-2">{r.label}</td>
                  {r.months.map((v, j) => (
                    <td key={j} className="text-right px-1">{v ? fmtEur(v) : "—"}</td>
                  ))}
                  <td className="text-right px-2 font-bold" style={{ color: C.navy }}>{fmtEur(r.total)}</td>
                </tr>
              ))}
              <tr className="border-t-2" style={{ borderColor: C.navy }}>
                <td className="py-2 px-2 font-bold" colSpan={2}>MONTHLY TOTAL</td>
                {monthlyTotals.map((m, i) => (
                  <td key={i} className="text-right px-1 font-semibold" style={{ color: C.navy }}>{fmtEur(m.planned)}</td>
                ))}
                <td className="text-right px-2 font-bold" style={{ color: C.navy }}>
                  {fmtEur(monthlyTotals.reduce((a, m) => a + m.planned, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold" style={{ color: C.navy }}>Project Expenses — Planned vs Actual</div>
          <button onClick={() => onAddExpense(active[0]?.id)} className="px-3 py-1 text-xs rounded-lg text-white" style={{ backgroundColor: C.green }}>+ Add expense</button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500 border-b">
            <tr><th className="text-left py-2">Project</th><th className="text-right"># Expenses</th>
            <th className="text-right">Spent (€)</th><th className="text-right">Planned 2026 DEVEX (€)</th>
            <th className="text-right">Variance</th></tr>
          </thead>
          <tbody>
            {active.map(p => {
              const spent = expenses.filter(e => e.projectId === p.id).reduce((a, e) => a + e.total, 0);
              const planned = budget2026.filter(r => r.label.toLowerCase().includes(p.name.toLowerCase().split(" ")[0]))
                .reduce((a, r) => a + r.total, 0);
              const variance = planned - spent;
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 font-medium" style={{ color: C.navy }}>{p.name}</td>
                  <td className="text-right">{expenses.filter(e => e.projectId === p.id).length}</td>
                  <td className="text-right">{fmtEurD(spent)}</td>
                  <td className="text-right">{fmtEur(planned)}</td>
                  <td className="text-right" style={{ color: variance >= 0 ? C.green : C.red }}>
                    {fmtEur(variance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ===================================================================
// SCORING MATRIX
// ===================================================================
function Scoring({ scoring, setScoring }) {
  const sorted = [...scoring].sort((a, b) => b.totScore - a.totScore);
  const maxScore = Math.max(...scoring.map(s => s.totScore), 1);

  const updScore = (i, k, v) => {
    const next = [...scoring];
    next[i] = { ...next[i], [k]: Number(v) };
    const keys = ["scoreLand", "scoreGrid", "scoreKV", "scoreLandType", "scoreUrban", "scoreDist",
      "scoreSubstation", "scorePermitting", "scorePermitStatus", "scoreMacse", "scoreFlex", "scoreGeoDiv", "scoreNode"];
    next[i].totScore = keys.reduce((a, kk) => a + (next[i][kk] || 0), 0);
    setScoring(next);
  };

  const scoreKeys = [
    { k: "scoreLand",       label: "Land" },
    { k: "scoreGrid",       label: "Grid" },
    { k: "scoreKV",         label: "KV" },
    { k: "scoreLandType",   label: "L.Type" },
    { k: "scoreUrban",      label: "Urban" },
    { k: "scoreDist",       label: "Dist" },
    { k: "scoreSubstation", label: "SubSt" },
    { k: "scorePermitting", label: "Permit" },
    { k: "scoreMacse",      label: "MACSE" },
    { k: "scoreFlex",       label: "Flex" },
    { k: "scoreNode",       label: "Node" },
  ];

  return (
    <div className="space-y-5">
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b bg-slate-50 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-slate-500">Ranking by total score — scores are editable (0–5)</div>
          <div className="text-xs text-slate-500">Max observed: <b style={{ color: C.navy }}>{maxScore}</b></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b bg-white">
              <tr>
                <th className="text-left py-3 px-3 font-semibold">#</th>
                <th className="text-left px-3 font-semibold">Project</th>
                <th className="text-right px-3 font-semibold">MW</th>
                <th className="text-right px-3 font-semibold">Land €/MW</th>
                <th className="text-right px-3 font-semibold border-r">Grid €/MW</th>
                {scoreKeys.map(({label}) => (
                  <th key={label} className="text-center px-1.5 font-semibold w-12">{label}</th>
                ))}
                <th className="text-center px-4 font-bold w-24" style={{ backgroundColor: C.navy, color: "white" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, rank) => {
                const idx = scoring.findIndex(x => x === s);
                const pct = (s.totScore / maxScore) * 100;
                return (
                  <tr key={s.projectId} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400 font-medium">{rank + 1}</td>
                    <td className="px-3 font-semibold whitespace-nowrap" style={{ color: C.navy }}>{s.name}</td>
                    <td className="text-right px-3">{s.mw}</td>
                    <td className="text-right px-3 text-slate-600">{fmtEur(s.landCostPerMw)}</td>
                    <td className="text-right px-3 text-slate-600 border-r">{fmtEur(s.gridCostPerMw)}</td>
                    {scoreKeys.map(({k}) => (
                      <td key={k} className="text-center px-1">
                        <input type="number" min={0} max={5} value={s[k] || 0}
                               onChange={(e) => updScore(idx, k, e.target.value)}
                               className="w-10 text-center border border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-slate-400 rounded py-0.5" />
                      </td>
                    ))}
                    <td className="text-center px-3 py-2"
                        style={{ backgroundColor: "#f1f5f9" }}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl font-bold leading-none" style={{ color: C.navy }}>{s.totScore}</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded overflow-hidden">
                          <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: C.green }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ===================================================================
// BOARD REPORT
// ===================================================================
function BoardReport({ projects, expenses, budget2026 }) {
  const active = projects.filter(p => !p.dropped && !p.suspended);
  const totalMw = active.reduce((a, p) => a + (p.powerMw || 0), 0);
  const totalMwh = active.reduce((a, p) => a + (p.capacityMwh || 0), 0);
  const totInv = active.reduce((a, p) => a + (p.connectionTotCost || 0) + (p.totOrigFee || 0) + (p.totDevFee || 0), 0);
  const budget26 = budget2026.reduce((a, r) => a + r.total, 0);
  const spent = expenses.reduce((a, e) => a + e.total, 0);

  const byRtb = active.reduce((acc, p) => {
    if (p.rtb) { acc[p.rtb] = acc[p.rtb] || []; acc[p.rtb][0] = (acc[p.rtb][0] || 0) + p.powerMw; acc[p.rtb][1] = (acc[p.rtb][1] || 0) + 1; acc[p.rtb][2] = acc[p.rtb][2] || []; acc[p.rtb][2].push(p.name); }
    return acc;
  }, {});
  const rtbList = Object.entries(byRtb).sort();

  return (
    <div className="space-y-5 print:p-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500">Board Report</div>
          <h1 className="text-2xl font-bold" style={{ color: C.navy }}>RelyAssets Italy — BESS Development</h1>
          <div className="text-sm text-slate-500">As of {new Date().toLocaleDateString("it-IT")}</div>
        </div>
        <button onClick={() => window.print()} className="px-3 py-1.5 text-sm rounded-lg text-white print:hidden" style={{ backgroundColor: C.navy }}>Print / Export</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Active Pipeline" value={fmtMw(totalMw)} sub={`${active.length} projects`} />
        <KPI label="Nominal Energy" value={`${totalMwh.toLocaleString("it-IT")} MWh`} sub="aggregate capacity" />
        <KPI label="Committed Investment" value={fmtEur(totInv)} sub="connection + orig + dev fees" />
        <KPI label="2026 Operating Budget" value={fmtEur(budget26)} sub={`${fmtEur(spent)} booked YTD`} accent={C.orange} />
      </div>

      <Card className="p-5">
        <div className="font-semibold mb-3" style={{ color: C.navy }}>Portfolio breakdown by Opportunity Status</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {TAX.opportunityStatus.map(s => {
            const ps = active.filter(p => p.status?.trim() === s);
            const mw = ps.reduce((a, p) => a + (p.powerMw || 0), 0);
            return (
              <div key={s} className="p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{s}</div>
                <div className="text-xl font-bold mt-1" style={{ color: C.navy }}>{ps.length}</div>
                <div className="text-xs text-slate-500">{fmtMw(mw)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-semibold mb-3" style={{ color: C.navy }}>Key Milestones — RTB Timeline</div>
        <div className="space-y-2">
          {rtbList.map(([rtb, data]) => (
            <div key={rtb} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
              <div className="w-20 text-sm font-bold" style={{ color: C.navy }}>{rtb}</div>
              <div className="flex-1 text-sm">{data[2].join(" · ")}</div>
              <div className="text-sm"><span className="font-semibold">{data[1]}</span> projects · <span className="font-semibold">{data[0]} MW</span></div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-semibold mb-3" style={{ color: C.navy }}>Notes & Risks — by Project</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {active.filter(p => p.comments).map(p => (
            <div key={p.id} className="p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <div className="font-medium" style={{ color: C.navy }}>{p.name}</div>
                <Badge color={statusColor(p.status)}>{p.status}</Badge>
              </div>
              <div className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{p.comments}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ===================================================================
// PRE-AUCTION
// ===================================================================
function PreAuction() {
  const [reservePremium, setReservePremium] = useState(25000);
  const [pct, setPct] = useState(0.10);

  const rows = PRE_AUCTION.map(r => ({
    ...r,
    guarantee: r.capacity * reservePremium * pct,
  }));
  const total = rows.reduce((a, r) => a + r.guarantee, 0);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="font-semibold mb-3" style={{ color: C.navy }}>Parameters</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500">Reserve Premium €/MWh-year</label>
            <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm"
                   value={reservePremium} onChange={e => setReservePremium(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Pre-Auction %</label>
            <input type="number" step="0.01" className="w-full border rounded-lg px-2 py-1.5 text-sm"
                   value={pct} onChange={e => setPct(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <div>
              <div className="text-xs text-slate-500">Total guarantees required</div>
              <div className="text-2xl font-bold" style={{ color: C.orange }}>{fmtEur(total)}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500 border-b bg-slate-50">
            <tr>
              <th className="text-left py-2 px-3">Project</th>
              <th className="text-right">Power (MW)</th>
              <th className="text-right">Duration (h)</th>
              <th className="text-right">Capacity Qualified (MWh)</th>
              <th className="text-right">Reserve €/MWh·yr</th>
              <th className="text-right">Pre-Auction %</th>
              <th className="text-right font-bold">Guarantee (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.projectId} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-2 px-3 font-medium" style={{ color: C.navy }}>{r.name}</td>
                <td className="text-right">{r.power}</td>
                <td className="text-right">{r.duration}</td>
                <td className="text-right">{r.capacity}</td>
                <td className="text-right">{fmtEur(reservePremium)}</td>
                <td className="text-right">{(pct*100).toFixed(1)}%</td>
                <td className="text-right font-bold" style={{ color: C.navy }}>{fmtEur(r.guarantee)}</td>
              </tr>
            ))}
            <tr className="border-t-2" style={{ borderColor: C.navy }}>
              <td className="py-2 px-3 font-bold" colSpan={6}>TOTAL</td>
              <td className="text-right font-bold" style={{ color: C.orange }}>{fmtEur(total)}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ===================================================================
// GLOBAL SETTINGS MODAL
// ===================================================================
function SettingsModal({ open, onClose, values, onSave }) {
  const [f, setF] = useState(values);
  React.useEffect(() => { setF(values); }, [values, open]);
  if (!open) return null;
  const upd = (k, v) => setF(s => ({ ...s, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Global Settings</div>
            <div className="text-lg font-bold" style={{ color: C.navy }}>Portfolio inputs</div>
          </div>
          <button onClick={onClose} className="text-slate-400 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-500">Contingencies</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min={0} max={1}
                     className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                     value={f.contingencies}
                     onChange={e => upd("contingencies", Number(e.target.value))} />
              <span className="text-sm text-slate-500 w-10">= {(f.contingencies * 100).toFixed(1)}%</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Buffer applied to project budget estimates.</div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Total Amount / MW (€)</label>
            <input type="number" step="1000" min={0}
                   className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                   value={f.totalAmountPerMw}
                   onChange={e => upd("totalAmountPerMw", Number(e.target.value))} />
            <div className="text-xs text-slate-400 mt-1">Reference capex per MW used in financial modelling.</div>
          </div>
          <div>
            <label className="text-xs text-slate-500">AU Issuance Fee</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.0001" min={0} max={1}
                     className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                     value={f.auIssuanceFee}
                     onChange={e => upd("auIssuanceFee", Number(e.target.value))} />
              <span className="text-sm text-slate-500 w-16">= {(f.auIssuanceFee * 100).toFixed(2)}%</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Authorization issuance fee rate.</div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <button onClick={() => setF(DEFAULT_GLOBAL_INPUTS)}
                  className="text-xs text-slate-500 underline">Reset to defaults</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200">Cancel</button>
            <button onClick={() => { onSave(f); onClose(); }}
                    className="px-3 py-1.5 text-sm rounded-lg text-white" style={{ backgroundColor: C.green }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// APP
// ===================================================================
export default function App() {
  const [current, setCurrent] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);

  // Load projects from Supabase on mount
  useEffect(() => {
    let mounted = true;
    fetchProjects()
      .then((list) => { if (mounted) { setProjects(list); setLoadingProjects(false); } })
      .catch((err) => {
        console.error("Error loading projects:", err);
        if (mounted) setLoadingProjects(false);
      });
    return () => { mounted = false; };
  }, []);

  const [scoring, setScoring] = useState(SEED_SCORING);
  const [budget2026] = useState(BUDGET_2026_ROWS);
  const [globalInputs, setGlobalInputs] = useState(DEFAULT_GLOBAL_INPUTS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [openProjectId, setOpenProjectId] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [addExpenseFor, setAddExpenseFor] = useState(null);

  const openProject = projects.find(p => p.id === openProjectId);

  const handleSaveProject = async (p) => {
    const isNew = !p.id;
    const id = isNew
      ? p.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36)
      : p.id;
    const project = { ...p, id };
    // Optimistic update
    if (isNew) setProjects(ps => [...ps, project]);
    else setProjects(ps => ps.map(x => x.id === id ? project : x));
    setEditProject(null);
    try {
      await upsertProject(project);
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Errore salvataggio progetto: " + err.message);
      // Rollback
      const fresh = await fetchProjects();
      setProjects(fresh);
    }
  };

  const handleAddExpense = (e) => {
    setExpenses(es => [...es, e]);
    setAddExpenseFor(null);
  };

  const updateFlags = async (id, patch) => {
    // Optimistic update
    setProjects(ps => ps.map(x => x.id === id ? { ...x, ...patch } : x));
    try {
      await updateProjectRemote(id, patch);
    } catch (err) {
      console.error("Error updating project flags:", err);
      alert("Errore aggiornamento: " + err.message);
      const fresh = await fetchProjects();
      setProjects(fresh);
    }
  };
  const handleSuspend = (id) => updateFlags(id, { suspended: true, dropped: false });
  const handleResume  = (id) => updateFlags(id, { suspended: false });
  const handleArchive = (id) => updateFlags(id, { dropped: true, suspended: false });
  const handleRestore = (id) => updateFlags(id, { dropped: false, suspended: false });

  const handleNewProject = () => setEditProject({
    name: "", status: "Under negotiation", spv: "Onda Energia",
    marketZone: "SUD", typology: "Stand-Alone", devMode: "Internal dvpt",
    stmg: "to be prepared", landType: "Agricultural", landStatus: "Under negotiation",
    devStatus: 0.10,
  });

  // Dropped placeholders now come from the DB (rows with dropped=true)
  const allProjects = projects;

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: C.bg, color: "#1e293b" }}>
      <Sidebar current={current} setCurrent={setCurrent} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              {NAV.find(n => n.id === current)?.label}
            </div>
            <div className="text-lg font-bold" style={{ color: C.navy }}>
              {current === "dashboard" && "Executive Overview"}
              {current === "pipeline" && "Project Pipeline"}
              {current === "budget" && "Budget & Finance — 2026"}
              {current === "scoring" && "Project Scoring Matrix"}
              {current === "board" && "Board Presentation"}
              {current === "preauction" && "MACSE Pre-Auction Guarantees"}
            </div>
          </div>
          <button onClick={() => setSettingsOpen(true)}
                  title="Global settings"
                  className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 text-lg">⚙</button>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
          {loadingProjects && (
            <div className="text-slate-500 text-sm">Caricamento progetti…</div>
          )}
          {!loadingProjects && current === "dashboard" && (
            <Dashboard projects={allProjects} expenses={expenses} budget2026={budget2026}
                       onOpenProject={(id) => setOpenProjectId(id)} />
          )}
          {!loadingProjects && current === "pipeline" && (
            <Pipeline projects={allProjects} onOpenProject={setOpenProjectId} onAddProject={handleNewProject}
                      onSuspend={handleSuspend} onResume={handleResume} onArchive={handleArchive} onRestore={handleRestore} />
          )}
          {!loadingProjects && current === "budget" && (
            <BudgetFinance projects={allProjects} expenses={expenses} budget2026={budget2026}
                           onAddExpense={setAddExpenseFor} />
          )}
          {!loadingProjects && current === "scoring" && <Scoring scoring={scoring} setScoring={setScoring} />}
          {!loadingProjects && current === "board" && <BoardReport projects={allProjects} expenses={expenses} budget2026={budget2026} />}
          {!loadingProjects && current === "preauction" && <PreAuction />}
        </div>
      </main>

      <ProjectDetail project={openProject} expenses={expenses}
                     onClose={() => setOpenProjectId(null)}
                     onEdit={(p) => { setOpenProjectId(null); setEditProject(p); }}
                     onAddExpense={(pid) => { setOpenProjectId(null); setAddExpenseFor(pid); }} />
      {editProject && <EditProjectModal project={editProject} onClose={() => setEditProject(null)} onSave={handleSaveProject} />}
      {addExpenseFor && <AddExpenseModal projectId={addExpenseFor} onClose={() => setAddExpenseFor(null)} onSave={handleAddExpense} />}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}
                     values={globalInputs} onSave={setGlobalInputs} />
    </div>
  );
}
