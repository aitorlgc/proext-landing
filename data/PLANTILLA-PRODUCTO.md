# Plantilla para añadir un PRODUCTO / ANUNCIO

Cada producto/anuncio del catálogo es un objeto dentro del array `products` en `data/products.json`.

Para añadir uno nuevo, pásame esta plantilla rellena y yo lo añado al archivo:

```
TÍTULO:           Pérgola Bioclimática Premium
CATEGORÍA:        pergolas-bioclimaticas | ventanas | toldos-y-pergolas | cerramientos
PRECIO:           Solicitar más información   (o un precio fijo, ej. "Desde 2.450 €")
ETIQUETA:         30%   (opcional — texto que sale como badge, ej. "Oferta", "Nuevo")

IMAGEN PRINCIPAL: /assets/anuncios/mi-imagen.jpg
THUMBNAILS:       /assets/anuncios/img2.jpg, /assets/anuncios/img3.jpg

DESCRIPCIÓN (1 párrafo, lo que sale debajo del título):
Transforma tu terraza con una pérgola bioclimática diseñada a medida...

CARACTERÍSTICAS PRINCIPALES (4 líneas tipo "Campo: valor", salen como bullet points):
- Material: Aluminio extrusionado de alta calidad
- Lamas Orientables: 0° a 140° con control remoto
- Motor: Silent system con garantía 5 años
- Resistencia viento: Hasta 120 km/h

CARACTERÍSTICAS DETALLADAS (acordeón, párrafo más largo, separar con saltos de línea):
Perfiles de aluminio extrusionado con tratamiento termolacado.
Lamas de 90mm con sistema de estanqueidad integrado.
Motor tubular silencioso con sistema de emergencia manual.

INSTALACIÓN (acordeón):
La instalación se realiza en 1-2 días. Nuestro equipo se encarga de todo...

GARANTÍA (acordeón):
5 años de garantía total en estructura y motor.
```

---

## Formato técnico (objeto JSON resultante)

Solo para referencia — yo me encargo de generar esto a partir de la plantilla:

```json
{
  "id": "uuid-generado-automaticamente",
  "title": "Pérgola Bioclimática Premium",
  "image": "/assets/anuncios/mi-imagen.jpg",
  "thumbnails": [
    "/assets/anuncios/img2.jpg",
    "/assets/anuncios/img3.jpg"
  ],
  "price": "Solicitar más información",
  "tag": "30%",
  "description": "Transforma tu terraza...",
  "category": "pergolas-bioclimaticas",
  "features": [
    "Material: Aluminio extrusionado de alta calidad",
    "Lamas Orientables: 0° a 140° con control remoto"
  ],
  "caracteristicas": "Perfiles de aluminio extrusionado...\nLamas de 90mm...",
  "instalacion": "La instalación se realiza en 1-2 días...",
  "garantia": "5 años de garantía total...",
  "createdAt": "2026-06-13T00:00:00.000Z"
}
```

---

## Cómo subir las imágenes

1. Sube los archivos a la carpeta `assets/anuncios/` del repo (desde tu PC con git).
2. Dime el nombre exacto de cada archivo y los pongo en los campos `image` y `thumbnails`.

Tamaño recomendado: imagen principal 1600×1200px aprox., thumbnails 800×600px. Formato JPG. Mantenlas por debajo de 500KB cada una.
