# Greenredtomatoes — Operación

App de inventario para oficina central y las 7 sucursales (Merliot, TOG, Soho, Cascadas, Tigo, Emblema, Kinetika). Reemplaza el cuadro semanal "RETAIL" de Excel.

## Usuarios

- **Dueña:** ve todo (costos, faltantes, cierre semanal), define el plan de distribución por días de la semana y el checklist de supervisión.
- **Operaciones** (Ricardo · inventario, Rebeca · distribución, Chris · supervisión): mismo acceso para poder cubrirse entre sí; cada acción queda firmada con el nombre de quien la hizo. No ven costos ni dinero.
- **Sucursal (tablet):** recibe envíos escaneando y hace el cierre del día. No ve el inventario esperado.

## Flujo

1. **Ingreso de proveedor** (oficina): el encargado cuenta lo que llegó y lo cierra con su usuario.
2. **Armar paquetes** (oficina): paquetes de un solo producto y tamaño fijo, cada uno con su etiqueta y código de barras.
3. **Distribución** (oficina): según el plan semanal de la dueña, Rebeca despacha (sale de bodega) y marca la entrega (lo dejó en la sucursal).
3b. **Supervisión**: Chris visita una sucursal cada día con el checklist y un conteo sorpresa.
4. **Recepción** (tablet): la sucursal escanea cada paquete con la cámara y aprueba con su PIN. Los paquetes faltantes o dañados quedan reportados.
5. **Cierre del día** (tablet): se anota lo vendido según la cinta y se cuenta lo que queda. El conteo es **ciego**: la sucursal nunca ve el inventario esperado.
6. **Cierre semanal** (oficina): se arma solo, con inicial, entradas, ventas por día, lo que debía quedar contra lo contado y la diferencia en dinero. El sobrante de un producto cubre el faltante de otro (neto).

Las tablets funcionan sin internet: guardan los registros y los sincronizan cuando vuelve la señal.

## Estado

- `prototipo/index.html`: prototipo navegable con datos y costos de ejemplo, sin backend. Publicado en GitHub Pages: https://romero-24.github.io/greenredtomatoes/ Para verlo, abra el archivo en un navegador o sírvalo con `py -m http.server --directory prototipo`.
