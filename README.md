# Chat en Tiempo Real con Angular, Ionic y Supabase
Este proyecto es una aplicación de chat en tiempo real construida con Angular 17, Ionic 7 y 
Supabase como backend. Permite a los usuarios registrarse, iniciar sesión y chatear en tiempo real,
mostrando el correo electrónico de cada usuario junto a sus mensajes.

# Características
  * Registro e inicio de sesión usando Supabase Auth.
  * Chat en tiempo real: todos los usuarios ven todos los mensajes instantáneamente.
  * Visualización del correo del usuario junto a cada mensaje.
  * Protección de rutas: solo usuarios autenticados pueden acceder al chat.
  * Standalone Components de Angular para mayor rendimiento y simplicidad.

# Estructura del proyecto
src/
  app/
    pages/
      login/         # Página de login y registro
      list/          # Página principal del chat
    services/
      supabase.service.ts  # Lógica de conexión y operaciones con Supabase
    guards/
      auth.guard.ts  # Protección de rutas
    app-routing.module.ts
    app.module.ts
  environments/
    environment.ts   # Configuración de Supabase
  assets/
  theme/
  global.scss

# Instalación y ejecución

  
# Capturas
![image](https://github.com/user-attachments/assets/09e4de94-36b8-454e-ac9d-b8269d2476db)
![image](https://github.com/user-attachments/assets/bd55ee63-eea1-4b6e-a5c1-2fc3ecafe17f)
![image](https://github.com/user-attachments/assets/5d51270c-eae2-40fb-920b-35b5084f2fec)
![image](https://github.com/user-attachments/assets/a087708b-9c1e-4b3f-ab5f-79fafd1b500c)
![image](https://github.com/user-attachments/assets/ec4cba67-e1a1-4994-9573-4f4c9a90f75f)




