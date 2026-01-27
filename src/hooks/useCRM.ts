import { useState, useCallback } from 'react';

// Konfiguracja CRM - zmień na swój endpoint gdy będzie gotowy
const CRM_CONFIG = {
  // Lokalne środowisko developerskie
  development: {
    baseUrl: 'http://localhost:8000/api',
    apiKey: '',
  },
  // Produkcja - zmień na swój domain
  production: {
    baseUrl: 'https://crm.codefix.it/api',
    apiKey: '',
  },
};

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const config = isDev ? CRM_CONFIG.development : CRM_CONFIG.production;

// Typy dla CRM
export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: 'website' | 'chat' | 'estimator' | 'contact_form';
  project_type?: string;
  budget_range?: string;
  timeline?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface Project {
  id?: number;
  lead_id?: number;
  name: string;
  description: string;
  type: string;
  technologies: string[];
  estimated_budget: number;
  estimated_hours: number;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
}

export interface Message {
  id?: number;
  lead_id?: number;
  direction: 'inbound' | 'outbound';
  channel: 'email' | 'chat' | 'phone' | 'sms';
  subject?: string;
  content: string;
  read: boolean;
  created_at?: string;
}

export interface CRMStats {
  total_leads: number;
  new_leads_this_month: number;
  conversion_rate: number;
  total_revenue: number;
  active_projects: number;
  pending_messages: number;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Hook do CRM
export function useCRM() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funkcja do wywołań API
  const apiCall = useCallback(async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown
  ): Promise<APIResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(`${config.baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Wystąpił błąd podczas komunikacji z CRM');
      }

      return { success: true, data: result.data || result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(errorMessage);
      console.error('CRM API Error:', err);
      
      // W trybie dev, logujemy dane które byłyby wysłane
      if (isDev) {
        console.log('📊 CRM Request (dev mode):', { endpoint, method, data });
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // === LEADS ===
  
  // Dodaj nowego leada
  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'status' | 'created_at'>): Promise<APIResponse<Lead>> => {
    // W trybie dev, symulujemy sukces
    if (isDev && !config.baseUrl.includes('localhost:8000')) {
      console.log('📧 New Lead (dev simulation):', lead);
      return {
        success: true,
        data: { ...lead, id: Date.now(), status: 'new', created_at: new Date().toISOString() },
        message: 'Lead zapisany lokalnie (tryb dev)',
      };
    }
    
    return apiCall<Lead>('/leads', 'POST', {
      ...lead,
      metadata: {
        ...lead.metadata,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      },
    });
  }, [apiCall]);

  // Pobierz wszystkich leadów
  const getLeads = useCallback(async (filters?: {
    status?: Lead['status'];
    source?: Lead['source'];
    from_date?: string;
    to_date?: string;
  }): Promise<APIResponse<Lead[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return apiCall<Lead[]>(`/leads?${params.toString()}`);
  }, [apiCall]);

  // Aktualizuj leada
  const updateLead = useCallback(async (id: number, updates: Partial<Lead>): Promise<APIResponse<Lead>> => {
    return apiCall<Lead>(`/leads/${id}`, 'PUT', updates);
  }, [apiCall]);

  // === MESSAGES ===

  // Wyślij wiadomość
  const sendMessage = useCallback(async (message: Omit<Message, 'id' | 'created_at'>): Promise<APIResponse<Message>> => {
    if (isDev) {
      console.log('💬 New Message (dev simulation):', message);
      return {
        success: true,
        data: { ...message, id: Date.now(), created_at: new Date().toISOString() },
      };
    }
    return apiCall<Message>('/messages', 'POST', message);
  }, [apiCall]);

  // Pobierz wiadomości
  const getMessages = useCallback(async (leadId?: number): Promise<APIResponse<Message[]>> => {
    const endpoint = leadId ? `/messages?lead_id=${leadId}` : '/messages';
    return apiCall<Message[]>(endpoint);
  }, [apiCall]);

  // === PROJECTS ===

  // Utwórz projekt
  const createProject = useCallback(async (project: Omit<Project, 'id'>): Promise<APIResponse<Project>> => {
    if (isDev) {
      console.log('🚀 New Project (dev simulation):', project);
      return {
        success: true,
        data: { ...project, id: Date.now() },
      };
    }
    return apiCall<Project>('/projects', 'POST', project);
  }, [apiCall]);

  // Pobierz projekty
  const getProjects = useCallback(async (): Promise<APIResponse<Project[]>> => {
    return apiCall<Project[]>('/projects');
  }, [apiCall]);

  // === STATS ===

  // Pobierz statystyki
  const getStats = useCallback(async (): Promise<APIResponse<CRMStats>> => {
    if (isDev) {
      return {
        success: true,
        data: {
          total_leads: 24,
          new_leads_this_month: 8,
          conversion_rate: 33.3,
          total_revenue: 45000,
          active_projects: 3,
          pending_messages: 5,
        },
      };
    }
    return apiCall<CRMStats>('/stats');
  }, [apiCall]);

  // === CONTACT FORM ===

  // Główna funkcja do formularza kontaktowego
  const submitContactForm = useCallback(async (formData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    projectType?: string;
    budget?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const result = await createLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      source: 'contact_form',
      project_type: formData.projectType,
      budget_range: formData.budget,
      metadata: {
        form_type: 'main_contact',
      },
    });

    if (result.success) {
      return {
        success: true,
        message: 'Dziękujemy! Twoja wiadomość została wysłana. Odezwiemy się wkrótce.',
      };
    }

    return {
      success: false,
      message: result.error || 'Wystąpił błąd podczas wysyłania wiadomości.',
    };
  }, [createLead]);

  // === CHAT ===

  // Zapisz rozmowę z chatbotem
  const saveChatConversation = useCallback(async (
    leadData: { name?: string; email?: string },
    messages: Array<{ role: 'user' | 'bot'; content: string; timestamp: string }>
  ): Promise<{ success: boolean }> => {
    if (!leadData.email) {
      return { success: false };
    }

    const result = await createLead({
      name: leadData.name || 'Chat User',
      email: leadData.email,
      message: messages.map(m => `[${m.role}]: ${m.content}`).join('\n'),
      source: 'chat',
      metadata: {
        chat_messages_count: messages.length,
        chat_duration: messages.length > 0 
          ? new Date(messages[messages.length - 1].timestamp).getTime() - new Date(messages[0].timestamp).getTime()
          : 0,
      },
    });

    return { success: result.success };
  }, [createLead]);

  // === ESTIMATOR ===

  // Zapisz wycenę z kalkulatora
  const saveEstimation = useCallback(async (estimation: {
    projectType: string;
    features: string[];
    priority: string;
    estimatedPrice: number;
    estimatedTime: string;
    contactEmail?: string;
    contactName?: string;
  }): Promise<{ success: boolean }> => {
    if (!estimation.contactEmail) {
      // Zapisz anonimowo w localStorage
      const savedEstimations = JSON.parse(localStorage.getItem('codefix_estimations') || '[]');
      savedEstimations.push({
        ...estimation,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('codefix_estimations', JSON.stringify(savedEstimations));
      return { success: true };
    }

    const result = await createLead({
      name: estimation.contactName || 'Estimation User',
      email: estimation.contactEmail,
      message: `Wycena projektu:\n- Typ: ${estimation.projectType}\n- Funkcje: ${estimation.features.join(', ')}\n- Priorytet: ${estimation.priority}\n- Szacowana cena: ${estimation.estimatedPrice} PLN\n- Szacowany czas: ${estimation.estimatedTime}`,
      source: 'estimator',
      project_type: estimation.projectType,
      budget_range: `${estimation.estimatedPrice} PLN`,
      timeline: estimation.estimatedTime,
      metadata: {
        features: estimation.features,
        priority: estimation.priority,
      },
    });

    return { success: result.success };
  }, [createLead]);

  return {
    // State
    isLoading,
    error,
    
    // Leads
    createLead,
    getLeads,
    updateLead,
    
    // Messages
    sendMessage,
    getMessages,
    
    // Projects
    createProject,
    getProjects,
    
    // Stats
    getStats,
    
    // Convenience functions
    submitContactForm,
    saveChatConversation,
    saveEstimation,
    
    // Config info
    isDevMode: isDev,
    crmUrl: config.baseUrl,
  };
}

// Laravel API endpoints reference (dla Twojego CRM)
/*
=== REQUIRED ENDPOINTS ===

POST /api/leads
  Body: { name, email, phone?, company?, message, source, project_type?, budget_range?, timeline?, metadata? }
  Response: { data: Lead }

GET /api/leads
  Query: status?, source?, from_date?, to_date?
  Response: { data: Lead[] }

PUT /api/leads/{id}
  Body: { status?, ... }
  Response: { data: Lead }

POST /api/messages
  Body: { lead_id?, direction, channel, subject?, content }
  Response: { data: Message }

GET /api/messages
  Query: lead_id?
  Response: { data: Message[] }

POST /api/projects
  Body: { lead_id?, name, description, type, technologies, estimated_budget, estimated_hours, status }
  Response: { data: Project }

GET /api/projects
  Response: { data: Project[] }

GET /api/stats
  Response: { data: CRMStats }

=== CORS CONFIG (Laravel) ===

// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'https://codefix.it'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];

=== EXAMPLE LARAVEL CONTROLLER ===

// app/Http/Controllers/LeadController.php
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email',
        'phone' => 'nullable|string',
        'message' => 'required|string',
        'source' => 'required|in:website,chat,estimator,contact_form',
        'project_type' => 'nullable|string',
        'budget_range' => 'nullable|string',
        'timeline' => 'nullable|string',
        'metadata' => 'nullable|array',
    ]);

    $lead = Lead::create([
        ...$validated,
        'status' => 'new',
        'metadata' => json_encode($validated['metadata'] ?? []),
    ]);

    // Notify via email
    Mail::to(config('mail.admin_email'))->send(new NewLeadNotification($lead));

    return response()->json(['data' => $lead], 201);
}
*/
