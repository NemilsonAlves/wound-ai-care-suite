import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileText, Download, Trash2, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MedicalRecord {
  id: string;
  date: Date;
  title: string;
  description: string;
  category: 'exame' | 'consulta' | 'procedimento' | 'medicacao' | 'outro';
  attachments: MedicalAttachment[];
  created_by: string;
}

interface MedicalAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: Date;
}

interface MedicalHistoryProps {
  patientId: string;
  records?: MedicalRecord[];
  onRecordAdd?: (record: Omit<MedicalRecord, 'id'>) => void;
  onRecordUpdate?: (recordId: string, record: Partial<MedicalRecord>) => void;
  onRecordDelete?: (recordId: string) => void;
}

const categories = [
  { value: 'exame', label: 'Exame', color: 'bg-blue-100 text-blue-800' },
  { value: 'consulta', label: 'Consulta', color: 'bg-green-100 text-green-800' },
  { value: 'procedimento', label: 'Procedimento', color: 'bg-purple-100 text-purple-800' },
  { value: 'medicacao', label: 'Medicação', color: 'bg-orange-100 text-orange-800' },
  { value: 'outro', label: 'Outro', color: 'bg-gray-100 text-gray-800' },
];

export function MedicalHistory({ 
  patientId, 
  records = [], 
  onRecordAdd, 
  onRecordUpdate, 
  onRecordDelete 
}: MedicalHistoryProps) {
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    category: 'consulta' as const,
    date: new Date(),
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Máximo 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo ${file.type} não permitido.`);
        return false;
      }
      
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRecord = async () => {
    if (!newRecord.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      // Simular upload de arquivos
      const uploadedAttachments: MedicalAttachment[] = attachments.map((file, index) => ({
        id: `attachment_${Date.now()}_${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // Em produção, seria a URL real do arquivo
        uploaded_at: new Date(),
      }));

      const record: Omit<MedicalRecord, 'id'> = {
        ...newRecord,
        attachments: uploadedAttachments,
        created_by: 'current_user', // Em produção, seria o ID do usuário atual
      };

      onRecordAdd?.(record);
      
      // Reset form
      setNewRecord({
        title: '',
        description: '',
        category: 'consulta',
        date: new Date(),
      });
      setAttachments([]);
      setIsAddingRecord(false);
      
      toast.success('Registro adicionado ao histórico médico');
    } catch (error) {
      toast.error('Erro ao adicionar registro');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[4];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico Clínico</CardTitle>
          <Button 
            onClick={() => setIsAddingRecord(true)}
            disabled={isAddingRecord}
          >
            <FileText className="mr-2 h-4 w-4" />
            Novo Registro
          </Button>
        </CardHeader>
        <CardContent>
          {isAddingRecord && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Registro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newRecord.title}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Consulta de retorno, Exame de sangue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <select
                      id="category"
                      value={newRecord.category}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={format(newRecord.date, 'yyyy-MM-dd')}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newRecord.description}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva os detalhes do registro médico"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Anexos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Arquivos
                    </Button>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Formatos aceitos: JPG, PNG, GIF, PDF, DOC, DOCX (máx. 10MB cada)
                    </p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Arquivos Selecionados:</Label>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingRecord(false);
                      setAttachments([]);
                      setNewRecord({
                        title: '',
                        description: '',
                        category: 'consulta',
                        date: new Date(),
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddRecord}>
                    Adicionar Registro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Registros */}
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum registro médico encontrado</p>
                <p className="text-sm">Adicione o primeiro registro clicando em "Novo Registro"</p>
              </div>
            ) : (
              records
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => {
                  const categoryInfo = getCategoryInfo(record.category);
                  return (
                    <Card key={record.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{record.title}</h3>
                              <Badge className={categoryInfo.color}>
                                {categoryInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Calendar className="mr-1 h-4 w-4" />
                              {format(new Date(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </div>
                            {record.description && (
                              <p className="text-gray-700 mb-3">{record.description}</p>
                            )}
                            
                            {record.attachments.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Anexos:</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {record.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <div>
                                          <p className="text-sm font-medium">{attachment.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {formatFileSize(attachment.size)} • {format(new Date(attachment.uploaded_at), 'dd/MM/yyyy')}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.open(attachment.url, '_blank')}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = attachment.url;
                                            link.download = attachment.name;
                                            link.click();
                                          }}
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRecordDelete?.(record.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}