'use client';

import { useEffect, useState } from 'react';
import { Mail, MailOpen, User, Clock, Tag, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';

interface ContactMessage {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur chargement messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpen = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.is_read) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/contact/${msg.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages(prev =>
          prev.map(m => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
        setSelected({ ...msg, is_read: true });
      }
    } catch {
      // silencieux
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages de contact</h1>
          <p className="text-sm text-gray-500 mt-1">
            {messages.length} message{messages.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Liste des messages */}
        <div className="lg:col-span-2 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun message reçu</p>
            </div>
          ) : (
            messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => handleOpen(msg)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-sm ${
                  selected?.id === msg.id
                    ? 'border-primary-300 bg-primary-50 shadow-sm'
                    : msg.is_read
                    ? 'border-gray-100 bg-white'
                    : 'border-primary-100 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {msg.is_read ? (
                      <MailOpen className="h-4 w-4 text-gray-300 shrink-0" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary-500 shrink-0" />
                    )}
                    <span className={`text-sm truncate ${msg.is_read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}>
                      {msg.full_name}
                    </span>
                  </div>
                  {!msg.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1" />
                  )}
                </div>
                <p className={`text-xs truncate mb-1 ${msg.is_read ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                  {msg.subject}
                </p>
                <p className="text-xs text-gray-400">{formatDate(msg.created_at)}</p>
              </button>
            ))
          )}
        </div>

        {/* Détail du message */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.subject}</h2>
                  {selected.is_read ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      <MailOpen className="h-3 w-3" /> Lu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-bold">
                      <Mail className="h-3 w-3" /> Non lu
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{selected.full_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${selected.email}`} className="text-primary-600 hover:underline">
                    {selected.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span>{selected.subject}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(selected.created_at)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>

              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors"
              >
                <Mail className="h-4 w-4" /> Répondre par email
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 h-64 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">Sélectionnez un message pour le lire</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
