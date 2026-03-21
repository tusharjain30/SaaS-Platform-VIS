import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/shared/Modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, Copy, Edit, Eye, File, FileText, Image, MessageSquare, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TemplateStatus = 'approved' | 'pending' | 'rejected' | 'draft';
type TemplateType = 'text' | 'media' | 'interactive';
type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
type TemplateButtonType = 'QUICK_REPLY' | 'URL' | 'CALL';

type TemplateButton = {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
};

interface Template {
  id: number | string;
  name: string;
  category: TemplateCategory;
  type: TemplateType;
  status: TemplateStatus;
  content: string;
  language: string;
  usageCount: number;
  createdAt: string;
  headerText?: string;
  footerText?: string;
  buttons?: TemplateButton[];
}

const initialTemplates: Template[] = [
  {
    id: 1,
    name: 'Welcome Message',
    category: 'MARKETING',
    type: 'text',
    status: 'approved',
    content: "Hello {{1}}! Welcome to our service. We're excited to have you on board!",
    language: 'en_US',
    usageCount: 1250,
    createdAt: '2024-01-10',
    buttons: [{ type: 'QUICK_REPLY', text: 'Get Started' }],
  },
  {
    id: 2,
    name: 'Order Confirmation',
    category: 'UTILITY',
    type: 'interactive',
    status: 'approved',
    content: 'Hi {{1}}, your order #{{2}} has been confirmed. Expected delivery: {{3}}.',
    language: 'en_US',
    usageCount: 890,
    createdAt: '2024-01-12',
    footerText: 'Track your order anytime',
    buttons: [{ type: 'URL', text: 'Track Order', url: 'https://example.com/track' }],
  },
  {
    id: 3,
    name: 'Appointment Reminder',
    category: 'UTILITY',
    type: 'interactive',
    status: 'approved',
    content: 'Reminder: You have an appointment scheduled for {{1}} at {{2}}. Reply YES to confirm.',
    language: 'en_US',
    usageCount: 567,
    createdAt: '2024-01-15',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Confirm' },
      { type: 'CALL', text: 'Call Clinic', phoneNumber: '+911234567890' },
    ],
  },
  { id: 4, name: 'Product Showcase', category: 'MARKETING', type: 'media', status: 'pending', content: 'Check out our new collection! {{1}}', language: 'en_US', usageCount: 0, createdAt: '2024-01-18' },
  { id: 5, name: 'Payment Receipt', category: 'UTILITY', type: 'text', status: 'rejected', content: 'Payment of {{1}} received. Transaction ID: {{2}}. Thank you!', language: 'en_US', usageCount: 0, createdAt: '2024-01-20' },
];

const statusStyles: Record<TemplateStatus, string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
};

const statusIcons = { approved: CheckCircle, pending: Clock, rejected: XCircle, draft: File };
const typeIcons = { text: MessageSquare, media: Image, interactive: FileText };
const categoryOptions: Array<{ value: TemplateCategory; label: string }> = [
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITY', label: 'Utility' },
  { value: 'AUTHENTICATION', label: 'Authentication' },
];
const formatLabel = (value: string) => value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  const filteredTemplates = templates.filter((template) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = template.name.toLowerCase().includes(search) || template.content.toLowerCase().includes(search);
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = () => {
    if (!selectedTemplate) return;
    setTemplates(templates.map((t) => (t.id === selectedTemplate.id ? { ...selectedTemplate, status: 'pending' as const } : t)));
    setIsEditModalOpen(false);
    toast({ title: 'Template updated', description: 'Your template has been resubmitted for approval.' });
  };

  const handleDelete = () => {
    if (!selectedTemplate) return;
    setTemplates(templates.filter((t) => t.id !== selectedTemplate.id));
    setIsDeleteModalOpen(false);
    toast({ title: 'Template deleted', description: 'The template has been removed.', variant: 'destructive' });
  };

  const handleDuplicate = (template: Template) => {
    const duplicate: Template = { ...template, id: Date.now(), name: `${template.name} (Copy)`, status: 'draft', usageCount: 0, createdAt: new Date().toISOString().split('T')[0] };
    setTemplates([duplicate, ...templates]);
    toast({ title: 'Template duplicated', description: 'A copy has been created in draft state.' });
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Message Templates</h1>
              <p className="text-muted-foreground">Create and manage WhatsApp-approved message templates</p>
            </div>
            <Button onClick={() => navigate('/templates/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{templates.length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{templates.filter((t) => t.status === 'approved').length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{templates.filter((t) => t.status === 'pending' || t.status === 'draft').length}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Usage</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{templates.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()}</div></CardContent></Card>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const StatusIcon = statusIcons[template.status];
              const TypeIcon = typeIcons[template.type];
              return (
                <Card key={template.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2"><TypeIcon className="h-4 w-4 text-primary" /></div>
                        <div><CardTitle className="text-base">{template.name}</CardTitle><p className="text-xs text-muted-foreground">{formatLabel(template.category)}</p></div>
                      </div>
                      <Badge className={statusStyles[template.status]}><StatusIcon className="mr-1 h-3 w-3" />{formatLabel(template.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{template.content}</p>
                    {template.buttons && template.buttons.length > 0 && <div className="flex flex-wrap gap-2">{template.buttons.slice(0, 2).map((button, index) => <Badge key={`${template.id}-${index}`} variant="outline" className="text-xs">{button.text}</Badge>)}</div>}
                    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{formatLabel(template.language)}</span><span>Used {template.usageCount} times</span></div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedTemplate(template); setIsPreviewModalOpen(true); }}><Eye className="mr-1 h-3 w-3" />Preview</Button>
                      <Button variant="outline" size="icon" onClick={() => { setSelectedTemplate(template); setIsEditModalOpen(true); }}><Edit className="h-3 w-3" /></Button>
                      <Button variant="outline" size="icon" onClick={() => handleDuplicate(template)}><Copy className="h-3 w-3" /></Button>
                      <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setSelectedTemplate(template); setIsDeleteModalOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Modal open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} title="Template Preview">
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="max-w-[280px] rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                    {selectedTemplate.headerText && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{selectedTemplate.headerText}</p>}
                    <p className="text-sm">{selectedTemplate.content}</p>
                    {selectedTemplate.footerText && <p className="mt-3 text-xs text-muted-foreground">{selectedTemplate.footerText}</p>}
                    {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && <div className="mt-4 space-y-2 border-t pt-3">{selectedTemplate.buttons.map((button, index) => <div key={index} className="rounded-lg border px-3 py-2 text-center text-sm text-primary">{button.text}</div>)}</div>}
                    <p className="mt-2 text-right text-xs text-muted-foreground">12:00 PM</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Status</p><Badge className={statusStyles[selectedTemplate.status]}>{formatLabel(selectedTemplate.status)}</Badge></div>
                  <div><p className="text-muted-foreground">Category</p><p>{formatLabel(selectedTemplate.category)}</p></div>
                  <div><p className="text-muted-foreground">Type</p><p className="capitalize">{selectedTemplate.type}</p></div>
                  <div><p className="text-muted-foreground">Usage Count</p><p>{selectedTemplate.usageCount}</p></div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
              </div>
            )}
          </Modal>

          <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} title="Edit Template">
            {selectedTemplate && (
              <div className="space-y-4">
                <div><Label>Template Name</Label><Input value={selectedTemplate.name} onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })} /></div>
                <div><Label>Message Content</Label><Textarea value={selectedTemplate.content} onChange={(e) => setSelectedTemplate({ ...selectedTemplate, content: e.target.value })} rows={4} /></div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save & Resubmit</Button></div>
              </div>
            )}
          </Modal>

          <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} title="Delete Template">
            <div className="space-y-4">
              <p>Are you sure you want to delete <strong>{selectedTemplate?.name}</strong>?</p>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}
