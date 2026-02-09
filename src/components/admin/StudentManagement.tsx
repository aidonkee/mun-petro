import { useState, useRef } from "react";
import { Upload, Plus, Trash2, Copy, Eye, EyeOff, Loader2, Download, CheckCircle, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DelegateProfile {
  id: string;
  user_id: string;
  delegate_name: string;
  country: string;
  committee: string;
  login_email: string | null;
  login_password: string | null;
  created_at: string;
}

interface CreatedCredentials {
  email: string;
  password: string;
  name: string;
  country: string;
  committee: string;
}

interface BulkImportResult {
  success: boolean;
  name: string;
  country: string;
  committee: string;
  email?: string;
  password?: string;
  error?: string;
}

interface BulkImportResponse {
  success: boolean;
  total: number;
  created: number;
  failed: number;
  results: BulkImportResult[];
}

export function StudentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [isBulkResultsDialogOpen, setIsBulkResultsDialogOpen] = useState(false);
  const [bulkImportResults, setBulkImportResults] = useState<BulkImportResponse | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [csvPreview, setCsvPreview] = useState<{ name: string; country: string; committee: string }[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    country: "",
    committee: "General Assembly",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch delegate profiles
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["delegate-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delegate_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DelegateProfile[];
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: typeof newStudent) => {
      const { data, error } = await supabase.functions.invoke("create-student", {
        body: studentData,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delegate-profiles"] });
      setCreatedCredentials({
        email: data.email,
        password: data.password,
        name: data.name,
        country: data.country,
        committee: data.committee,
      });
      setNewStudent({ name: "", country: "", committee: "General Assembly" });
      setIsDialogOpen(false);
      setIsCredentialsDialogOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать ученика",
        variant: "destructive",
      });
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (students: { name: string; country: string; committee: string }[]) => {
      const { data, error } = await supabase.functions.invoke("bulk-create-students", {
        body: { students },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data as BulkImportResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delegate-profiles"] });
      setBulkImportResults(data);
      setIsBulkImportDialogOpen(false);
      setIsBulkResultsDialogOpen(true);
      setCsvPreview([]);
    },
    onError: (error) => {
      toast({
        title: "Ошибка импорта",
        description: error.message || "Не удалось импортировать учеников",
        variant: "destructive",
      });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("delegate_profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegate-profiles"] });
      toast({
        title: "Ученик удалён",
        description: "Профиль ученика был удалён",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить ученика",
        variant: "destructive",
      });
    },
  });

  const handleBulkImport = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string): { name: string; country: string; committee: string }[] => {
    const lines = text.trim().split("\n");
    const results: { name: string; country: string; committee: string }[] = [];
    
    // Skip header if present
    const startIndex = lines[0]?.toLowerCase().includes("name") || 
                       lines[0]?.toLowerCase().includes("имя") ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle both comma and semicolon separators
      const separator = line.includes(";") ? ";" : ",";
      const parts = line.split(separator).map(p => p.trim().replace(/^["']|["']$/g, ""));
      
      if (parts.length >= 2) {
        results.push({
          name: parts[0],
          country: parts[1],
          committee: parts[2] || "General Assembly",
        });
      }
    }
    
    return results;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Неверный формат",
        description: "Пожалуйста, загрузите CSV файл",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        toast({
          title: "Пустой файл",
          description: "CSV файл не содержит данных для импорта",
          variant: "destructive",
        });
        return;
      }

      if (parsed.length > 100) {
        toast({
          title: "Слишком много записей",
          description: "Максимум 100 учеников за один импорт",
          variant: "destructive",
        });
        return;
      }

      setCsvPreview(parsed);
      setIsBulkImportDialogOpen(true);
    };
    
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmBulkImport = () => {
    if (csvPreview.length === 0) return;
    bulkImportMutation.mutate(csvPreview);
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.country.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    createStudentMutation.mutate(newStudent);
  };

  const handleDeleteStudent = (userId: string) => {
    deleteStudentMutation.mutate(userId);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопирован в буфер обмена`,
    });
  };

  const copyAllCredentials = () => {
    if (!createdCredentials) return;
    const text = `Ученик: ${createdCredentials.name}\nСтрана: ${createdCredentials.country}\nКомитет: ${createdCredentials.committee}\nЛогин: ${createdCredentials.email}\nПароль: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Все данные скопированы в буфер обмена",
    });
  };

  const downloadBulkResults = () => {
    if (!bulkImportResults) return;
    
    const successfulResults = bulkImportResults.results.filter(r => r.success);
    if (successfulResults.length === 0) {
      toast({
        title: "Нет данных",
        description: "Нет успешно созданных учеников для экспорта",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      "Имя,Страна,Комитет,Логин,Пароль",
      ...successfulResults.map(r => 
        `"${r.name}","${r.country}","${r.committee}","${r.email}","${r.password}"`
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credentials_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Файл скачан",
      description: "Учётные данные сохранены в CSV файл",
    });
  };

  const downloadSampleCSV = () => {
    const sampleContent = `Имя,Страна,Комитет
Иван Иванов,Россия,General Assembly
John Smith,США,UNSC
Marie Dupont,Франция,WHO`;

    const blob = new Blob(["\uFEFF" + sampleContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_students.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-heading">Управление учениками</h2>
          <p className="text-muted-foreground mt-1">
            {students.length} делегатов зарегистрировано
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Добавить ученика
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Добавить нового ученика</DialogTitle>
                <DialogDescription>
                  Логин и пароль будут сгенерированы автоматически
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя ученика</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Введите имя ученика"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Страна</Label>
                  <Input
                    id="country"
                    value={newStudent.country}
                    onChange={(e) =>
                      setNewStudent((prev) => ({ ...prev, country: e.target.value }))
                    }
                    placeholder="Введите назначенную страну"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="committee">Комитет</Label>
                  <Select
                    value={newStudent.committee}
                    onValueChange={(value) =>
                      setNewStudent((prev) => ({ ...prev, committee: value }))
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Выберите комитет" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="General Assembly">Генеральная Ассамблея</SelectItem>
                      <SelectItem value="UNSC">Совет Безопасности</SelectItem>
                      <SelectItem value="DISEC">ДИСЕК</SelectItem>
                      <SelectItem value="WHO">ВОЗ</SelectItem>
                      <SelectItem value="ECOFIN">ЭКОФИН</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddStudent} 
                  className="w-full"
                  disabled={createStudentMutation.isPending}
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    "Создать ученика"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2" onClick={handleBulkImport}>
            <Upload className="w-4 h-4" />
            Импорт CSV
          </Button>
        </div>
      </div>

      {/* Single Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">✓ Ученик создан</DialogTitle>
            <DialogDescription>
              Сохраните данные для входа. Пароль показывается только один раз!
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Имя:</span>
                  <span className="font-medium">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Страна:</span>
                  <span className="font-medium">{createdCredentials.country}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Комитет:</span>
                  <span className="font-medium">{createdCredentials.committee}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Логин (Email)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={createdCredentials.email} 
                      readOnly 
                      className="font-mono bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(createdCredentials.email, "Логин")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Пароль</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={createdCredentials.password}
                        readOnly
                        className="font-mono bg-muted pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(createdCredentials.password, "Пароль")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={copyAllCredentials} className="w-full gap-2">
                <Copy className="w-4 h-4" />
                Скопировать все данные
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Preview Dialog */}
      <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
        <DialogContent className="bg-background max-w-2xl">
          <DialogHeader>
            <DialogTitle>Предпросмотр импорта</DialogTitle>
            <DialogDescription>
              Проверьте данные перед импортом. Найдено {csvPreview.length} записей.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Будет создано {csvPreview.length} учеников
              </span>
              <Button variant="ghost" size="sm" onClick={downloadSampleCSV} className="gap-2">
                <FileText className="w-4 h-4" />
                Скачать образец CSV
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Имя</TableHead>
                    <TableHead className="font-semibold">Страна</TableHead>
                    <TableHead className="font-semibold">Комитет</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvPreview.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.country}</TableCell>
                      <TableCell>{student.committee}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsBulkImportDialogOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleConfirmBulkImport}
                className="flex-1 gap-2"
                disabled={bulkImportMutation.isPending}
              >
                {bulkImportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Импортировать
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Results Dialog */}
      <Dialog open={isBulkResultsDialogOpen} onOpenChange={setIsBulkResultsDialogOpen}>
        <DialogContent className="bg-background max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {bulkImportResults?.failed === 0 ? (
                <span className="text-primary">✓ Импорт завершён успешно</span>
              ) : (
                <span>Импорт завершён с ошибками</span>
              )}
            </DialogTitle>
            <DialogDescription>
              Создано {bulkImportResults?.created} из {bulkImportResults?.total} учеников
            </DialogDescription>
          </DialogHeader>
          
          {bulkImportResults && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогресс</span>
                  <span className="text-muted-foreground">
                    {bulkImportResults.created}/{bulkImportResults.total}
                  </span>
                </div>
                <Progress 
                  value={(bulkImportResults.created / bulkImportResults.total) * 100} 
                  className="h-2"
                />
              </div>

              <ScrollArea className="h-[350px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">Статус</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Страна</TableHead>
                      <TableHead>Логин</TableHead>
                      <TableHead>Пароль</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkImportResults.results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{result.name}</TableCell>
                        <TableCell>{result.country}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {result.email || <span className="text-destructive">{result.error}</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {result.password || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsBulkResultsDialogOpen(false)}
                  className="flex-1"
                >
                  Закрыть
                </Button>
                <Button 
                  onClick={downloadBulkResults}
                  className="flex-1 gap-2"
                  disabled={bulkImportResults.created === 0}
                >
                  <Download className="w-4 h-4" />
                  Скачать учётные данные (CSV)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="diplomatic-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Имя</TableHead>
              <TableHead className="font-semibold">Страна</TableHead>
              <TableHead className="font-semibold">Комитет</TableHead>
              <TableHead className="font-semibold">Логин</TableHead>
              <TableHead className="font-semibold">Пароль</TableHead>
              <TableHead className="font-semibold text-right w-20">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Нет зарегистрированных учеников
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{student.delegate_name}</TableCell>
                  <TableCell>{student.country}</TableCell>
                  <TableCell>{student.committee}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.login_email ? (
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[150px]">{student.login_email}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => copyToClipboard(student.login_email!, "Логин")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.login_password ? (
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[100px]">{student.login_password}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => copyToClipboard(student.login_password!, "Пароль")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteStudent(student.user_id)}
                      disabled={deleteStudentMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
