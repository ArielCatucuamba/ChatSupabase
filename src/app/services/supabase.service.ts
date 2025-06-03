import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AlertController } from '@ionic/angular'; // <-- Agrega esto

const MESSAGE_DB = 'todos'; // Usar la tabla 'todos'

export interface Message {
  id: number;
  inserted_at: string;
  content: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
  imageUrl?: string; // <-- Agregado para compatibilidad con mensajes de imagen
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private _messages: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  private _currentUser: BehaviorSubject<User | null | false> = new BehaviorSubject<User | null | false>(null);

  private supabase: SupabaseClient;

  constructor(
    private router: Router,
    private alertController: AlertController // <-- Agrega esto
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.loadUser();

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event == 'SIGNED_IN' && session && session.user) {
        this._currentUser.next(session.user);
        this.loadMessages();
        this.handleMessagesChanged();
      } else {
        this._currentUser.next(false);
      }
    });
  }

  async signUpWithProfile(email: string, password: string, full_name: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name }
      }
    });
  }

  // Método para subir avatar
  async uploadAvatar(userId: string, file: File) {
    const filePath = `avatars/${userId}_${Date.now()}`;
    const { data, error } = await this.supabase
      .storage
      .from('archivos')
      .upload(filePath, file);
    if (error) throw error;
    const { data: publicUrlData } = this.supabase
      .storage
      .from('archivos')
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  // Método para actualizar perfil
  async updateProfile(data: any) {
    return await this.supabase.auth.updateUser({ data });
  }

  async loadUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (user) {
      // Si el usuario no tiene avatar, asignar el avatar por defecto
      if (!user.user_metadata?.['avatar_url']) {
        user.user_metadata = {
          ...user.user_metadata,
          avatar_url: 'https://svgsilh.com/svg/1299805.svg'
        };
      }
      this._currentUser.next(user);
    } else {
      this._currentUser.next(false);
    }
  }

  get currentUser(): Observable<User | null | false> {
    return this._currentUser.asObservable();
  }

  get messages(): Observable<Message[]> {
    return this._messages.asObservable();
  }

  async loadMessages() {
    const { data } = await this.supabase
      .from(MESSAGE_DB)
      .select('*')
      .order('inserted_at', { ascending: true });

    this._messages.next((data ?? []).map((item: any) => ({
      id: item.id,
      inserted_at: item.inserted_at,
      content: item.task,
      user_id: item.user_id,
      user_email: item.user_email,
      user_name: item.user_name,
      user_avatar: item.user_avatar
    })));
  }

  async sendMessage(content: string) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;
    const email = user.email ?? '';
    let avatar = user.user_metadata?.['avatar_url'];
    if (!avatar || avatar === '') {
      avatar = 'https://svgsilh.com/svg/1299805.svg';
    }
    // Solo envía el mensaje a la base de datos, no lo agregues localmente aquí
    await this.supabase.from(MESSAGE_DB).insert({
      user_id: user.id,
      task: content,
      user_email: email,
      user_name: user.user_metadata?.['full_name'] || email,
      user_avatar: avatar
    });
    // Opcional: puedes mostrar un toast/alert aquí si lo deseas, pero no recargues los mensajes
  }

  handleMessagesChanged() {
    this.supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload: any) => {
          if (payload.eventType == 'INSERT') {
            const newMsg: Message = {
              id: payload.new.id,
              inserted_at: payload.new.inserted_at,
              content: payload.new.task,
              user_id: payload.new.user_id,
              user_email: payload.new.user_email,
              user_name: payload.new.user_name,
              user_avatar: payload.new.user_avatar
            };
            this._messages.next([...this._messages.value, newMsg]);
          }
        }
      )
      .subscribe();
  }

  signOut() {
    this.supabase.auth.signOut().then(_ => {
      this.router.navigateByUrl('/');
    });
  }

  async signIn(credentials: { email: string; password: string }): Promise<any> {
    const { error, data } = await this.supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    // Redirigir al chat después de iniciar sesión exitosa
    this.router.navigateByUrl('/chat');
    return data;
  }

  async signUp(credentials: { email: string; password: string }): Promise<any> {
    const { error, data } = await this.supabase.auth.signUp(credentials);
    if (error) throw error;
    return data;
  }
}