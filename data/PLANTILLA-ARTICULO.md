# Plantilla para añadir un ARTÍCULO del Diario (blog)

Cada artículo es un objeto dentro del array `articles` en `data/articles.json`.

Para publicar uno nuevo, pásame esta plantilla rellena y yo lo añado al archivo:

```
TÍTULO:    Cómo elegir la pérgola bioclimática perfecta
IMAGEN:    /assets/articulos/mi-imagen.jpg
FECHA:     2026-06-13   (opcional — si no la pones uso la del día)

RESUMEN (1-2 frases, sale en la portada del blog y debajo del título):
Una guía completa para entender los materiales, las dimensiones y el
sistema de control que mejor encaja con tu terraza.

CONTENIDO (el artículo completo; cada línea en blanco separa un párrafo):
Llevamos más de diez años fabricando pérgolas bioclimáticas y hemos visto
de todo. Las preguntas más habituales siempre giran alrededor de los
mismos tres puntos.

El primero es el material. Aunque la mayoría son de aluminio, no todo el
aluminio es igual: el extrusionado de alta calidad pesa más, aguanta
mejor el viento y no se deforma con los años.

El segundo es el sistema de motorización. Los motores tubulares con
sensor de viento y lluvia son ya un estándar...
```

---

## Formato técnico (objeto JSON resultante)

Solo para referencia — yo me encargo de generar esto:

```json
{
  "id": "uuid-generado-automaticamente",
  "title": "Cómo elegir la pérgola bioclimática perfecta",
  "image": "/assets/articulos/mi-imagen.jpg",
  "excerpt": "Una guía completa para entender los materiales...",
  "content": "Llevamos más de diez años fabricando pérgolas...\n\nEl primero es el material...",
  "createdAt": "2026-06-13T00:00:00.000Z"
}
```

---

## Cómo subir la imagen

1. Sube el archivo a `assets/articulos/` del repo (créalo si no existe).
2. Dime el nombre exacto y lo pongo en el campo `image`.

Tamaño recomendado: 1600×900px (16:9), JPG, por debajo de 400KB.
