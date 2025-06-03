# 📱 ChatApp - Funcionalidades Implementadas

Este proyecto es una aplicación de chat en tiempo real con funcionalidades modernas como envío de imágenes, ubicación GPS, integración con una API pública de Pokémon y despliegue para Android. A continuación, se detallan las características implementadas.

## 1. 🔐 Autenticación y Registro de Usuarios

- **Registro de usuarios**: Formulario con email, contraseña, nombre completo y avatar (imagen).
  - El avatar se sube a Supabase Storage y su URL se guarda en el perfil.
- **Login**: Inicio de sesión mediante email y contraseña .
  - Redirección automática al chat tras autenticarse.
 
![image](https://github.com/user-attachments/assets/c6a3d311-c12d-449e-b352-8d9d67f876b1)
![image](https://github.com/user-attachments/assets/d0555cea-4fa6-42d6-a066-dccd95a412aa)
![image](https://github.com/user-attachments/assets/e9d1a7ac-902c-4a78-85ff-1517a017897d)



## 2. 💬 Chat en Tiempo Real (Supabase Realtime)

- **Mensajes instantáneos**: Sin recarga de página gracias a Supabase Realtime.
- **Visualización completa**: Nombre, avatar (por defecto si no se sube uno) y contenido del mensaje.
- **Sincronización en tiempo real**: Los mensajes se muestran instantáneamente para todos los usuarios conectados.

![image](https://github.com/user-attachments/assets/b6dc9f35-f4f2-48d3-a279-fdec33abbe91)


## 3. 📍 Envío y Visualización de Ubicación (GPS)

- **Botón de ubicación**: Utiliza el GPS del dispositivo para obtener la localización actual.
- **Mensaje con coordenadas y enlace**:
  - Se muestra un mensaje con las coordenadas.
  - Otro mensaje incluye un enlace directo a Google Maps.
 
![image](https://github.com/user-attachments/assets/34c226bb-15e3-44be-b6bf-2f0d12efa40b)
![image](https://github.com/user-attachments/assets/d3c0285b-8215-4441-92a0-e7060fa93ce9)
![image](https://github.com/user-attachments/assets/2fec195f-6aa3-48bc-811f-80d2dccaea8a)


## 4. 📸 Captura y Envío de Fotografías

- **Acceso a cámara**: Funciona en PC y móvil, permite vista previa y captura de imagen.
- **Subida a Supabase Storage**: La imagen se guarda en un bucket y se genera una URL pública.
- **Mensaje en chat**: La imagen se muestra como parte del flujo del chat.

## 5. 🎮 Envío de Mensajes Pokémon (API Pública)

- **Botón Pokémon**: Llama a la [PokéAPI](https://pokeapi.co/) para obtener un Pokémon aleatorio.
- **Mensaje generado**: Contiene nombre, número, tipo y sprite (imagen) del Pokémon.
- **Visualización**: Se integra como un mensaje más en el chat.

## 6. 🖥️ Interfaz de Usuario

- **Diseño intuitivo**: Cada mensaje se presenta en tarjetas con avatar, nombre, contenido, fecha y tipo de mensaje.
- **Botones accesibles**: Acciones rápidas para enviar texto, ubicación, foto o Pokémon.

## 7. 📱 Despliegue en Android

- **Uso de Capacitor**: Para compilar la app como aplicación Android.
- **Build & deploy**:
  - Proceso de compilación.
  - Copia de archivos web.
  - Integración con Android Studio para generar el APK.

## 8. 🛠️ Notas Técnicas

- **Supabase**: 
  - Autenticación de usuarios.
  - Almacenamiento de archivos (avatars y fotos).
  - Comunicación en tiempo real.
- **Firebase**: Utilizado en pruebas iniciales para ubicación y almacenamiento.
- **PokéAPI**: API pública usada para obtener datos de Pokémon aleatorios.
- **Gestión de errores**: Validaciones y alertas para mejorar la experiencia de usuario.
