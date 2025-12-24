# Lumara: The Beginning

![Version](https://img.shields.io/badge/version-1.0.0--stable-blue)
![Performance](https://img.shields.io/badge/latency-1.6%20%C2%B5s-green)
![License](https://img.shields.io/badge/license-proprietary-red)
![Build](https://img.shields.io/badge/build-optimized-orange)

> [!IMPORTANT]
> **Propriété Intellectuelle :** Lumara est un logiciel propriétaire. Toute tentative d'ingénierie inverse, de décompilation ou de redistribution du code source est strictement interdite par les lois internationales sur le copyright.

## 1. Présentation Générale
Lumara: The Beginning est un environnement d'exécution et une machine virtuelle (VM) de haute précision. Développé pour minimiser la latence d'exécution, le moteur utilise une architecture native sans dépendances externes (Zero-NPM), garantissant une isolation totale et une vitesse de traitement optimale pour les calculs critiques.

## 2. Indicateurs de Performance
> [!NOTE]
> Benchmarks réalisés sur architecture x64 (Node.js 20+). Latences mesurées après stabilisation du JIT.

| Opération | Latence Moyenne | Statut |
| :--- | :--- | :--- |
| **Exécution Logique Standard** | 0.001600 ms (1.6 µs) | `Ultra-Low Latency` |
| **Simulation Physique (5k)** | 0.001800 ms (1.8 µs) | `Stable` |
| **Allocation Mémoire** | 0.000000 ms (Static) | `Instant` |

## 3. Architecture du Système

### 3.1 Gestion de la Mémoire (Static Flat Memory)
Contrairement aux environnements managés classiques, Lumara repose sur un segment mémoire pré-alloué via `Float64Array`.
* **Zero Garbage Collection :** Aucune pause d'exécution durant les cycles de calcul.
* **Cache L1 Optimization :** Structure de données linéaire pour maximiser la localité spatiale.

### 3.2 Pipeline de Compilation
1. **Tokenisation :** Analyse par tables de recherche `Uint8Array`.
2. **Bytecode Generation :** Mapping d'instructions vers un jeu d'opcodes propriétaires.
3. **JIT Warmup :** Optimisation forcée du moteur V8 pour une exécution machine native.



## 4. Spécifications du Langage

<details>
<summary><b>Voir la syntaxe de référence</b></summary>

Le langage supporte les opérations arithmétiques 64-bit et le contrôle de flux déterministe.

```rust
let height = 100;
let gravity = 1;
let velocity = 0;

while height > 0 {
    let velocity = velocity + gravity;
    let height = height - velocity;
    if 0 > height {
        let height = 1;
        let velocity = 0 - velocity;
    }
}
