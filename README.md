# Greenredtomatoes — Operación

App de inventario para oficina central y las 7 sucursales (Merliot, TOG, Soho, Cascadas, Tigo, Emblema, Kinetika). Reemplaza el cuadro semanal "RETAIL" de Excel.

## Flujo

1. **Ingreso de proveedor** (oficina): el encargado cuenta lo que llegó y lo cierra con su usuario.
2. **Armar paquetes** (oficina): paquetes de un solo producto y tamaño fijo, cada uno con su etiqueta y código de barras.
3. **Envío** (oficina): se escanean los paquetes que salen a una sucursal y el envío queda "en camino".
4. **Recepción** (tablet): la sucursal escanea cada paquete con la cámara y aprueba con su PIN. Los paquetes faltantes o dañados quedan reportados.
5. **Cierre del día** (tablet): se anota lo vendido según la cinta y se cuenta lo que queda. El conteo es **ciego**: la sucursal nunca ve el inventario esperado.
6. **Cierre semanal** (oficina): se arma solo, con inicial, entradas, ventas por día, lo que debía quedar contra lo contado y la diferencia en dinero.

Las tablets funcionan sin internet: guardan los registros y los sincronizan cuando vuelve la señal.

## Estado

- `prototipo/index.html`: prototipo navegable con datos y costos de ejemplo, sin backend. Publicado en GitHub Pages: https://romero-24.github.io/greenredtomatoes/ Para verlo, abra el archivo en un navegador o sírvalo con `py -m http.server --directory prototipo`.
