# Buscaminas 95

Reimplementación en React del Buscaminas de Windows 95, con un modo Rogue añadido.

## Ejecutar

```
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente http://localhost:5173).

## Modo clásico

- Principiante, Intermedio, Experto y Personalizado (menú **Juego**).
- Clic izquierdo descubre, clic derecho marca (bandera, interrogación), clic en un número o botón central abre las casillas de alrededor.
- **F2** o la carita: nueva partida. Los mejores tiempos se guardan en el navegador.
- Menú **Ver** para elegir el zoom (100%, 150%, 200%, 300%).

## Modo Rogue

Menú **Juego → Modo Rogue...**

- Desciende 10 pisos. Cada piso es un tablero más grande con más minas.
- Tienes 3 vidas. Pisar una mina resta una vida, pero la partida sigue. Sin vidas, se acaba la partida.
- Algunas casillas esconden oro. Al despejar un piso recibes más oro y pasas por la tienda.
- Objetos: Radar, Perro, Escudo, Alicates, Botiquín.
- Cada 3 pisos eliges una reliquia con efecto permanente (Amuleto, Brújula, Bolsa, Detector, Casco, Trébol).
- La semilla hace la partida reproducible.
