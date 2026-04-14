-- ============================================================
-- Seed projects (10 active/suspended + 16 dropped placeholders)
-- Run AFTER 01_schema_projects.sql
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- ============================================================

insert into public.projects (
  id, name, status, spv, dev_status, market_zone, regione, provincia, comune,
  typology, rtb, power_mw, capacity_h, capacity_mwh, es_volt, es_dist, stmg,
  cod_pratica, stmg_request, stmg_received, stmg_expiration, connection,
  stmg_acc_vat, connection_tot_cost, land_type, ha, land_status, loi_sign, loi_exp,
  dev_mode, originator, orig_fee_per_mw, tot_orig_fee, developer, dev_fee, tot_dev_fee,
  m1, m2, m3, m4, m5, comments, suspended, dropped
) values
-- Galatone
('galatone','Galatone','DSA signed','Luce Energia Srl',0.35,'SUD','Puglia','Lecce','Galatone',
 'Stand-Alone','2026 Q4',96,6,576,150,0.75,'accepted',
 null,null,null,null,null,0,null,'Agricultural',null,'Preliminary Agreement(s) Notarized',null,null,
 'Co-Development','Raffaello',null,0,'Raffaello Energy',18000,1728000,
 null,null,null,null,null,
 'meeting Friday 25 - calendar to be shared. Dataroom to be uploaded. AU doc submission on August 10th 2025',
 false,false),

-- Latiano
('latiano','Latiano','Under negotiation','Onda Energia',0.25,'SUD','Puglia','Brindisi','Latiano',
 'Stand-Alone','2027 Q2',500,4,2000,380,0.7,'accepted',
 null,null,null,null,null,null,null,'Agricultural',null,'Private Agreement signed',null,null,
 'Purchase as is','SCM Ingegneria',1500,750000,'Internal',1000,500000,
 266000,266000,268000,null,null,
 'Legal DD to be quoted. OPDE teaser shared.',
 false,false),

-- Ariano Irpino
('ariano','Ariano Irpino','Land secured','Onda Energia',0.20,'CSUD','Campania','Avellino','Ariano Irpino',
 'Stand-Alone','2027 Q1',96,8,768,150,0.7,'received',
 202504522,'2025-10-06','2025-11-10','2026-04-14','36KV',55594.81,151898.4,
 'Agricultural',17,'Exclusivity Letter signed',null,null,
 'Internal dvpt','Internal',0,0,'Internal',1000,96000,
 null,null,null,null,null,'STMG received 29/10/2025',false,false),

-- Acquaviva 2
('acquaviva2','Aquaviva delle Fonti 2','Land secured','Onda Energia',0.20,'SUD','Puglia','Bari','Aquaviva delle Fonti',
 'Stand-Alone','2027 Q2',10,8,80,150,0.6,'received',
 202505890,'2025-10-06','2025-12-19',null,null,5072.76,13860,
 'Agricultural',null,'Exclusivity Letter signed','2024-04-08','2026-04-02',
 'Internal dvpt','Fast Deals',3000,30000,'Internal',1000,null,
 30,150,null,null,null,'STMG submitted on August 1st (then +90 working days)',false,false),

-- Acquaviva 1
('acquaviva1','Aquaviva delle Fonti 1','Land secured','Onda Energia',0.20,'SUD','Puglia','Bari','Aquaviva delle Fonti',
 'Stand-Alone','2026 Q4',30,8,240,null,null,'received',
 202504773,'2025-11-13','2025-11-26',null,'36KV',55594.81,151898.4,
 'Agricultural',null,'Exclusivity Letter signed','2025-04-08','2026-04-05',
 'Internal dvpt','Fast Deals',null,null,null,null,null,
 null,null,null,null,null,null,false,false),

-- Cerignola 1
('cerignola1','Cerignola 1','Land secured','Onda Energia',0.20,'SUD','Puglia','Foggia','Cerignola',
 'Stand-Alone','2026 Q4',50,4,200,150,0.6,'received',
 202505917,'2025-11-13','2025-12-17',null,'36KV',27999,76500,
 'Agricultural',4,'Exclusivity Letter signed','2025-09-15','2026-06-15',
 'Internal dvpt','Fast Deals',3000,150000,'Internal',1000,null,
 30,150,null,null,null,'Exclusivity signed, STMG in preparation',false,false),

-- Cerignola 2
('cerignola2','Cerignola 2','Land secured','Onda Energia',0.20,'SUD','Puglia','Foggia','Cerignola',
 'Stand-Alone','2027 Q2',96,4,384,150,0.6,'received',
 202505919,'2025-11-13','2025-12-17',null,'36KV',53758.08,146880,
 'Agricultural',1.7,'Exclusivity Letter signed','2025-09-15','2026-06-15',
 'Internal dvpt','Fast Deals',3000,288000,'Internal',1000,null,
 30,150,null,null,null,'Exclusivity signed, STMG in preparation',false,false),

-- Casamassima
('casamassima','Casamassima','Land secured','Onda Energia',0.20,'SUD','Puglia','Bari','Casamassima',
 'Stand-Alone','2026 Q4',10,4,40,150,0.9,'received',
 202505916,'2025-11-13','2025-12-19',null,'36KV',5072.76,13860,
 'Agricultural',1.2,'Exclusivity Letter signed','2025-08-19','2026-05-19',
 'Internal dvpt','Fast Deals',3000,30000,'Internal',1500,null,
 null,null,null,null,null,null,false,false),

-- Andria
('andria','Andria','Land secured','Onda Energia',0.20,'SUD','Puglia','Bari','Andria',
 'Stand-Alone','2026 Q4',80,8,640,150,0.5,'received',
 202505915,'2025-11-13','2025-12-19',null,'36KV',44798.4,122400,
 'Agricultural',1.2,'Exclusivity Letter signed','2025-10-09','2026-10-06',
 'Internal dvpt','Fast Deals',3000,240000,null,null,null,
 null,null,null,null,null,null,false,false),

-- Acquaviva 10 (Suspended)
('acquaviva10','Acquaviva 10 (Suspended)','Under negotiation','Onda Energia',0.10,'SUD','Puglia','Bari','Aquaviva delle Fonti',
 'Stand-Alone',null,10,8,80,null,null,null,
 null,null,null,null,null,null,null,'Agricultural',null,'Under negotiation',null,null,
 null,null,null,null,null,null,null,
 null,null,null,null,null,'PROJECT SUSPENDED',true,false)

on conflict (id) do nothing;

-- Dropped projects (placeholders)
insert into public.projects (id, name, dropped) values
('drop-aragona','Aragona',true),
('drop-pescopagano','Pescopagano',true),
('drop-caravaggio','Caravaggio',true),
('drop-rende-rtb','Rende RTB',true),
('drop-taranto','Taranto',true),
('drop-pontirolo','Pontirolo',true),
('drop-borgosesia','Borgosesia',true),
('drop-fondi','Fondi',true),
('drop-ciminna','Ciminna',true),
('drop-ragusa','Ragusa',true),
('drop-priolo','Priolo',true),
('drop-chiaramonte-gulfi-1','Chiaramonte Gulfi 1',true),
('drop-chiaramonte-gulfi-2','Chiaramonte Gulfi 2',true),
('drop-pachino','Pachino',true),
('drop-san-donaci','San Donaci',true),
('drop-cuneo','Cuneo',true)
on conflict (id) do nothing;
