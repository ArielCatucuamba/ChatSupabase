import { SupabaseService, Message } from './../../services/supabase.service';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // Instala uuid: npm install uuid

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class ListPage implements OnInit, AfterViewInit {
  messages: Message[] = [];
  messageText = '';
  private messagesSub?: Subscription;

  @ViewChild('messagesList', { static: false }) messagesList?: ElementRef;

  constructor(private supabaseService: SupabaseService, private renderer: Renderer2) { }

  ngOnInit() {
    this.messagesSub = this.supabaseService.messages.subscribe(msgs => {
      this.messages = msgs;
      setTimeout(() => this.scrollToBottom(), 100);
    });

    // Suscribirse a Firestore para mensajes de imagen en tiempo real
    const db = getFirestore();
    const messagesCol = collection(db, 'messages');
    // Importa onSnapshot de firebase/firestore si no lo tienes:
    // import { onSnapshot, query, orderBy } from 'firebase/firestore';
    // Y agrega esto:
    // const q = query(messagesCol, orderBy('created_at'));
    // onSnapshot(q, (snapshot) => {
    //   const imageMsgs = snapshot.docs.map(doc => ({
    //     ...doc.data(),
    //     id: doc.id,
    //     inserted_at: doc.data().created_at?.toDate?.().toISOString?.() || new Date().toISOString()
    //   }));
    //   // Combina mensajes de Supabase y Firestore (sin duplicados)
    //   this.messages = [
    //     ...this.messages.filter(m => !m.imageUrl),
    //     ...imageMsgs.filter((m: any) => m.imageUrl)
    //   ];
    //   setTimeout(() => this.scrollToBottom(), 100);
    // });

    // Si solo quieres que el emisor vea la imagen instantáneamente, no necesitas esto.
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 200);
  }

  async sendMessage() {
    if (this.messageText.trim().length > 0) {
      const tempText = this.messageText.trim();
      // Reflejar el mensaje instantáneamente en la UI
      const user = (await this.supabaseService['supabase'].auth.getUser()).data.user;
      if (user) {
        let avatar = user.user_metadata?.['avatar_url'];
        if (!avatar || avatar === '') {
          avatar = 'https://img.freepik.com/vector-premium/icono-rostro-masculino-avatar-set-diseno-plano-perfiles-redes-sociales_1281173-3806.jpg?semt=ais_hybrid&w=740';
        }
        const tempMsg: Message = {
          id: Date.now(),
          inserted_at: new Date().toISOString(),
          content: tempText,
          user_id: user.id,
          user_email: user.email ?? '',
          user_name: user.user_metadata?.['full_name'] || (user.email ?? ''),
          user_avatar: avatar
        };
        this.messages = [...this.messages, tempMsg];
      }
      this.messageText = ''; // Limpiar el input inmediatamente
      setTimeout(() => this.scrollToBottom(), 100);
      await this.supabaseService.sendMessage(tempText);
    }
  }

  async sendLocation() {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coordsMsg = `Mis coordenadas: (${lat}, ${lng})`;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        // Reflejar ambos mensajes instantáneamente en la UI
        const user = (await this.supabaseService['supabase'].auth.getUser()).data.user;
        if (user) {
          let avatar = user.user_metadata?.['avatar_url'];
          if (!avatar || avatar === '') {
            avatar = 'https://img.freepik.com/vector-premium/icono-rostro-masculino-avatar-set-diseno-plano-perfiles-redes-sociales_1281173-3806.jpg?semt=ais_hybrid&w=740';
          }
          const tempMsgCoords: Message = {
            id: Date.now(),
            inserted_at: new Date().toISOString(),
            content: coordsMsg,
            user_id: user.id,
            user_email: user.email ?? '',
            user_name: user.user_metadata?.['full_name'] || (user.email ?? ''),
            user_avatar: avatar
          };
          const tempMsgMap: Message = {
            id: Date.now() + 1,
            inserted_at: new Date().toISOString(),
            content: mapsUrl,
            user_id: user.id,
            user_email: user.email ?? '',
            user_name: user.user_metadata?.['full_name'] || (user.email ?? ''),
            user_avatar: avatar
          };
          this.messages = [...this.messages, tempMsgCoords, tempMsgMap];
        }
        setTimeout(() => this.scrollToBottom(), 100);
        await this.supabaseService.sendMessage(coordsMsg);
        await this.supabaseService.sendMessage(mapsUrl);
      },
      (error) => {
        let msg = 'No se pudo obtener la ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado. Activa los permisos en tu navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'La información de ubicación no está disponible.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'La solicitud de ubicación expiró.';
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async captureAndSendPhoto() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('La cámara no está soportada en este navegador.');
      return;
    }

    // Crear overlay para la cámara
    const overlay = this.renderer.createElement('div');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100vw');
    this.renderer.setStyle(overlay, 'height', '100vh');
    this.renderer.setStyle(overlay, 'background', 'rgba(0,0,0,0.8)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'flexDirection', 'column');
    this.renderer.setStyle(overlay, 'justifyContent', 'center');
    this.renderer.setStyle(overlay, 'alignItems', 'center');
    this.renderer.setStyle(overlay, 'zIndex', '9999');

    // Crear elemento de video
    const video = this.renderer.createElement('video');
    video.autoplay = true;
    video.style.maxWidth = '90vw';
    video.style.maxHeight = '70vh';
    this.renderer.appendChild(overlay, video);

    // Crear botón verde para capturar
    const button = this.renderer.createElement('button');
    button.innerText = '📸 Capturar';
    this.renderer.setStyle(button, 'background', '#28a745');
    this.renderer.setStyle(button, 'color', '#fff');
    this.renderer.setStyle(button, 'border', 'none');
    this.renderer.setStyle(button, 'borderRadius', '50px');
    this.renderer.setStyle(button, 'padding', '16px 32px');
    this.renderer.setStyle(button, 'fontSize', '1.2em');
    this.renderer.setStyle(button, 'marginTop', '24px');
    this.renderer.setStyle(button, 'cursor', 'pointer');
    this.renderer.appendChild(overlay, button);
    document.body.appendChild(overlay);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      await new Promise(resolve => {
        video.onloadedmetadata = () => resolve(true);
      });

      button.onclick = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        stream?.getTracks().forEach(track => track.stop());
        document.body.removeChild(overlay);

        canvas.toBlob(async (blob) => {
          if (!blob) return;

          // Subir imagen al storage de Supabase
          const user = (await this.supabaseService['supabase'].auth.getUser()).data.user;
          let avatar = user?.user_metadata?.['avatar_url'];
          if (!avatar || avatar === '') {
            avatar = 'https://img.freepik.com/vector-premium/icono-rostro-masculino-avatar-set-diseno-plano-perfiles-redes-sociales_1281173-3806.jpg?semt=ais_hybrid&w=740';
          }
          const fileName = `chat_images/${user?.id}_${uuidv4()}.jpg`;
          const { data, error } = await this.supabaseService['supabase']
            .storage
            .from('archivos')
            .upload(fileName, blob, { contentType: 'image/jpeg' });
          if (error) {
            alert('Error al subir la imagen a Supabase Storage');
            return;
          }
          // Obtener la URL pública de la imagen
          const { data: publicUrlData } = this.supabaseService['supabase']
            .storage
            .from('archivos')
            .getPublicUrl(fileName);
          const imageUrl = publicUrlData.publicUrl;

          // Reflejar la imagen instantáneamente en el chat local
          const tempMsg: Message = {
            id: Date.now(),
            inserted_at: new Date().toISOString(),
            content: imageUrl, // la URL de la imagen como mensaje
            user_id: user?.id || '',
            user_email: user?.email || '',
            user_name: user?.user_metadata?.['full_name'] || user?.email || 'Usuario',
            user_avatar: avatar
          };
          this.messages = [...this.messages, tempMsg];
          setTimeout(() => this.scrollToBottom(), 100);

          // Enviar mensaje a Supabase con la URL de la imagen en el campo "task"
          await this.supabaseService['supabase']
            .from('todos')
            .insert({
              user_id: user?.id || '',
              task: imageUrl,
              user_email: user?.email || '',
              user_name: user?.user_metadata?.['full_name'] || user?.email || 'Usuario',
              user_avatar: avatar
            });
        }, 'image/jpeg', 0.95);
      };
    } catch (err) {
      alert('No se pudo acceder a la cámara.');
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (overlay.parentNode) document.body.removeChild(overlay);
    }
  }

  async sendRandomPokemon() {
    // Obtener un Pokémon aleatorio de la API pública
    const randomId = Math.floor(Math.random() * 898) + 1; // 1 a 898 (Gen 1-8)
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    if (!response.ok) {
      alert('No se pudo obtener el Pokémon');
      return;
    }
    const poke = await response.json();
    // Características básicas: nombre, id, tipo(s), sprite
    const name = poke.name;
    const id = poke.id;
    const types = poke.types.map((t: any) => t.type.name).join(', ');
    const sprite = poke.sprites.front_default;

    const msg = `Pokémon: ${name} (#${id})\nTipo: ${types}\n${sprite ? '[imagen]' : ''}`;
    const user = (await this.supabaseService['supabase'].auth.getUser()).data.user;
    let avatar = user?.user_metadata?.['avatar_url'];
    if (!avatar || avatar === '') {
      avatar = 'https://img.freepik.com/vector-premium/icono-rostro-masculino-avatar-set-diseno-plano-perfiles-redes-sociales_1281173-3806.jpg?semt=ais_hybrid&w=740';
    }

    // Reflejar instantáneamente en el chat local
    const tempMsg: Message = {
      id: Date.now(),
      inserted_at: new Date().toISOString(),
      content: msg,
      user_id: user?.id || '',
      user_email: user?.email || '',
      user_name: user?.user_metadata?.['full_name'] || user?.email || 'Usuario',
      user_avatar: avatar
    };
    this.messages = [...this.messages, tempMsg];
    setTimeout(() => this.scrollToBottom(), 100);

    // Enviar mensaje a Supabase
    await this.supabaseService['supabase']
      .from('todos')
      .insert({
        user_id: user?.id || '',
        task: msg,
        user_email: user?.email || '',
        user_name: user?.user_metadata?.['full_name'] || user?.email || 'Usuario',
        user_avatar: avatar
      });

    // Si hay sprite, envía la imagen como mensaje aparte (opcional)
    if (sprite) {
      const tempImgMsg: Message = {
        id: Date.now() + 1,
        inserted_at: new Date().toISOString(),
        content: sprite,
        user_id: user?.id || '',
        user_email: user?.email || '',
        user_name: user?.user_metadata?.['full_name'] || user?.email || 'Usuario',
        user_avatar: avatar
      };
      this.messages = [...this.messages, tempImgMsg];
      setTimeout(() => this.scrollToBottom(), 100);

      await this.supabaseService['supabase']
        .from('todos')
        .insert({
          user_id: user?.id || '',
          task: sprite,
          user_email: user?.email || '',
          user_name: user?.user_metadata?.['full_name'] || user?.email || 'Usuario',
          user_avatar: avatar
        });
    }
  }

  scrollToBottom() {
    if (this.messagesList) {
      try {
        this.messagesList.nativeElement.scrollTop = this.messagesList.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }

  signOut() {
    this.supabaseService.signOut();
  }

  ngOnDestroy() {
    this.messagesSub?.unsubscribe();
  }
}