---
name: phase-scope-guard
description: Review whether a task or prompt respects the current project stage, scope, and minimum necessary depth before execution.
---

# Phase Scope Guard - TCDS

## Contexto del proyecto

TCDS se trabaja por etapas cerradas.

Flujo:
- este hilo define negocio, arquitectura, prioridades y etapas
- Codex aterriza decisiones técnicas sobre el repo real
- Cursor ejecuta cambios concretos

Problema a evitar:
- saltar de etapa
- mezclar objetivos
- sobreconstruir
- abrir el alcance sin querer

---

## Objetivo

Revisar una tarea, prompt o pedido antes de ejecutarlo y determinar si:

- respeta la etapa actual;
- tiene alcance claro;
- pide el mínimo suficiente;
- evita mezclar setup, arquitectura y features;
- no fuerza decisiones que todavía no corresponden.

---

## Qué revisar siempre

- cuál es la etapa actual del proyecto
- cuál es el objetivo real de esta tarea
- si el prompt está mezclando:
  - base técnica
  - dominio
  - implementación
  - UI final
  - integraciones
- si el alcance está abierto o ambiguo
- si hay riesgo de que Cursor “complete de más”
- si se están creando capas, archivos o abstracciones por prolijidad y no por necesidad
- si la tarea puede resolverse con menos superficie

- si el prompt para Cursor es demasiado grande o abierto
- si la tarea puede dividirse en pasos más pequeños y ejecutables
- si faltan archivos objetivo o límites claros de ejecución

---

## Reglas

- NO ampliar el alcance de la etapa actual
- NO mezclar varias etapas en una sola ejecución
- NO empujar arquitectura prematura
- NO permitir prompts ambiguos si pueden generar sobretrabajo
- Priorizar siempre el mínimo cambio suficiente para habilitar la siguiente etapa

- Si el prompt es grande o ambiguo, dividirlo antes de ejecutar
- No permitir que Cursor tenga que interpretar arquitectura o intención

---

## Output

1. Etapa actual identificada  
2. Qué parte del pedido sí corresponde a esta etapa  
3. Qué parte del pedido se está adelantando o mezclando  
4. Riesgos de sobrealcance  
5. Decisión: ejecutar o dividir en múltiples prompts  
6. Versión corregida del alcance  
7. Prompt ajustado o validado  

---

## Señales de alerta

- “ya que estamos” → ALERTA
- “dejemos preparado por si después” → ALERTA
- placeholders vacíos sin uso inmediato → ALERTA
- arquitectura linda pero no necesaria → ALERTA
- setup + feature + integración en un solo prompt → ALERTA
- decisiones de producto reabiertas en una etapa técnica → ALERTA

---

## Criterio de decisión

Un prompt está bien si:
- corresponde a la etapa actual,
- tiene límite claro,
- no deja espacio a interpretación expansiva,
- y produce un resultado pequeño pero sólido.

Un prompt está mal si:
- puede terminar en sobrearquitectura,
- mezcla objetivos,
- o permite avanzar más de lo que se validó.