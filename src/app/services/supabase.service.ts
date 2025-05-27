import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const MESSAGE_DB = 'todos'; // Usar la tabla 'todos'

export interface Message {
  id: number;
  inserted_at: string;
  content: string;
  user_id: string;
  user_email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private _messages: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  private _currentUser: BehaviorSubject<User | null | false> = new BehaviorSubject<User | null | false>(null);

  private supabase: SupabaseClient;

  constructor(private router: Router) {
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

  async loadUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (user) {
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
      user_email: item.user_email
    })));
  }

  async sendMessage(content: string) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;
    const newMessage = {
      user_id: user.id,
      task: content,
      user_email: user.email // Guarda el email
    };
    await this.supabase.from(MESSAGE_DB).insert(newMessage);
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
              user_email: payload.new.user_email // Usa el email guardado
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
    return data;
  }

  async signUp(credentials: { email: string; password: string }): Promise<any> {
    const { error, data } = await this.supabase.auth.signUp(credentials);
    if (error) throw error;
    return data;
  }
}