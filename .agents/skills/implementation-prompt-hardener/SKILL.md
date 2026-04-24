---
name: implementation-prompt-hardener
description: Harden an implementation prompt for safe execution in Cursor in a Next.js + Supabase project.
---

# Implementation Prompt Hardener - TCDS

## Contexto del proyecto

Stack:
- Next.js (App Router)
- Supabase (Postgres, Auth, Storage)
- Mercado Pago (Checkout + Webhooks)

Dominio:
- productos + variantes
- fulfillment (express / encargo)
- personalización
- pedidos con snapshot

---

## Objetivo

Tomar un prompt definido y hacerlo seguro para ejecutar en el repo real sin romper lógica existente.

---

## Qué revisar siempre

- validaciones de datos
- queries a Supabase
- consistencia con modelo de dominio
- edge cases reales:
  - sin stock
  - personalización
  - pedidos mixtos
- duplicación de lógica
- manejo de estados (payment / operational)
- snapshot en pedidos

---

## Reglas

- NO cambiar el alcance del feature
- NO refactorizar sin motivo
- NO agregar complejidad innecesaria
- Priorizar cambios mínimos y seguros

---

## Output

1. Problemas del prompt original  
2. Riesgos técnicos  
3. Prompt mejorado  
4. Qué testear después  

---

## Alertas críticas

- lógica de fulfillment en UI → ERROR
- cálculo de precio duplicado → ERROR
- escritura directa a DB sin validación → ERROR
- uso incorrecto de webhooks → ERROR
---
name: implementation-prompt-hardener
description: Harden an implementation prompt for safe execution in Cursor in a Next.js + Supabase project.
---

# Implementation Prompt Hardener - TCDS

## Contexto del proyecto

Stack:
- Next.js (App Router)
- Supabase (Postgres, Auth, Storage)
- Mercado Pago (Checkout + Webhooks)

Dominio:
- productos + variantes
- fulfillment (express / encargo)
- personalización
- pedidos con snapshot

Modo de trabajo:
- estrategia y definición por etapas
- Codex aterriza técnicamente
- Cursor ejecuta
- no se mezclan etapas ni se amplía alcance implícitamente

---

## Objetivo

Tomar un prompt definido y hacerlo seguro para ejecutar en el repo real sin romper lógica existente, sin ampliar el alcance y sin empujar arquitectura o features fuera de la etapa actual.

---

## Qué revisar siempre

- validaciones de datos
- queries a Supabase
- consistencia con modelo de dominio
- edge cases reales:
  - sin stock
  - personalización
  - pedidos mixtos
- duplicación de lógica
- manejo de estados (payment / operational)
- snapshot en pedidos
- si el alcance está demasiado abierto
- si el prompt mezcla base técnica con features
- si Cursor podría interpretar que debe crear más estructura de la necesaria
- si se están pidiendo decisiones que todavía no corresponden a la etapa actual

---

## Reglas

- NO cambiar el alcance del feature
- NO ampliar el alcance implícitamente
- NO convertir una etapa base en una etapa de implementación completa
- NO refactorizar sin motivo
- NO agregar complejidad innecesaria
- Priorizar cambios mínimos, seguros y suficientes para destrabar la siguiente etapa

---

## Output

1. Problemas del prompt original  
2. Riesgos técnicos  
3. Riesgos de alcance / etapa  
4. Prompt mejorado  
5. Qué testear después  

---

## Alertas críticas

- lógica de fulfillment en UI → ERROR
- cálculo de precio duplicado → ERROR
- escritura directa a DB sin validación → ERROR
- uso incorrecto de webhooks → ERROR
- estructura o capas creadas solo por prolijidad → ERROR
- mezcla de setup técnico con implementación de features → ERROR