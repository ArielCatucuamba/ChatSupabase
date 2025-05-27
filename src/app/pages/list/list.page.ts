import { SupabaseService, Message } from './../../services/supabase.service';
import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class ListPage implements OnInit {
  messages = this.supabaseService.messages;
  messageText = '';

  constructor(private supabaseService: SupabaseService) { }

  ngOnInit() {}

  async sendMessage() {
    if (this.messageText.trim().length > 0) {
      await this.supabaseService.sendMessage(this.messageText.trim());
      this.messageText = '';
    }
  }

  signOut() {
    this.supabaseService.signOut();
  }
}