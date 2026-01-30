import { useState, useRef } from "react";
import { Upload, Plus, Trash2, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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

interface DelegateProfile {
  id: string;
  user_id: string;
  delegate_name: string;
  country: string;
  committee: string;
  created_at: string;
}

interface CreatedCredentials {
  email: string;
  password: string;
  name: string;
  country: string;
  committee: string;
}

export function StudentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
    onError: (error) => {
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

    toast({
      title: "CSV импорт",
      description: "Функция массового импорта будет доступна в следующей версии",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      {/* Credentials Dialog */}
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

      {/* Table */}
      <div className="diplomatic-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Имя</TableHead>
              <TableHead className="font-semibold">Страна</TableHead>
              <TableHead className="font-semibold">Комитет</TableHead>
              <TableHead className="font-semibold text-right w-20">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Нет зарегистрированных учеников
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{student.delegate_name}</TableCell>
                  <TableCell>{student.country}</TableCell>
                  <TableCell>{student.committee}</TableCell>
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
