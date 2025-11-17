"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import { toast } from "sonner";

interface TemplateFormProps {
  onSuccess?: () => void;
}

export function TemplateForm({ onSuccess }: TemplateFormProps) {
  const createTemplate = useMutation(api.notificationTemplates.create);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("custom");
  const [channels, setChannels] = useState<string[]>(["email"]);

  // Email fields
  const [emailSubject, setEmailSubject] = useState("");
  const [emailHtmlBody, setEmailHtmlBody] = useState("");
  const [emailTextBody, setEmailTextBody] = useState("");

  // SMS fields
  const [smsBody, setSmsBody] = useState("");

  // Push fields
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushIcon, setPushIcon] = useState("");
  const [pushClickAction, setPushClickAction] = useState("");

  const [variables, setVariables] = useState("name, email, phone");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChannelToggle = (channel: string) => {
    setChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (channels.length === 0) {
      toast.error("Selecciona al menos un canal");
      return;
    }

    setIsSubmitting(true);

    try {
      const variablesList = variables.split(",").map(v => v.trim()).filter(Boolean);

      const templateData: any = {
        name,
        description: description || undefined,
        type: type as any,
        channels: channels as any[],
        variables: variablesList,
      };

      if (channels.includes("email")) {
        templateData.emailTemplate = {
          subject: emailSubject,
          htmlBody: emailHtmlBody,
          textBody: emailTextBody || undefined,
        };
      }

      if (channels.includes("sms")) {
        templateData.smsTemplate = {
          body: smsBody,
        };
      }

      if (channels.includes("push")) {
        templateData.pushTemplate = {
          title: pushTitle,
          body: pushBody,
          icon: pushIcon || undefined,
          clickAction: pushClickAction || undefined,
        };
      }

      await createTemplate(templateData);

      toast.success("Plantilla creada exitosamente");

      // Reset form
      setName("");
      setDescription("");
      setType("custom");
      setChannels(["email"]);
      setEmailSubject("");
      setEmailHtmlBody("");
      setEmailTextBody("");
      setSmsBody("");
      setPushTitle("");
      setPushBody("");
      setPushIcon("");
      setPushClickAction("");
      setVariables("name, email, phone");

      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast.error(error.message || "Error al crear la plantilla");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            Configura los detalles básicos de la plantilla
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la plantilla *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Bienvenida a nuevos clientes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito de esta plantilla"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de plantilla *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Bienvenida</SelectItem>
                <SelectItem value="purchase_confirmation">Confirmación de compra</SelectItem>
                <SelectItem value="loyalty_points">Puntos de fidelidad</SelectItem>
                <SelectItem value="promotion">Promoción</SelectItem>
                <SelectItem value="birthday">Cumpleaños</SelectItem>
                <SelectItem value="payment_receipt">Recibo de pago</SelectItem>
                <SelectItem value="low_stock_alert">Alerta de stock bajo</SelectItem>
                <SelectItem value="custom">Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Canales de notificación *</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={channels.includes("email")}
                  onCheckedChange={() => handleChannelToggle("email")}
                />
                <label htmlFor="email" className="text-sm cursor-pointer">
                  Email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={channels.includes("sms")}
                  onCheckedChange={() => handleChannelToggle("sms")}
                />
                <label htmlFor="sms" className="text-sm cursor-pointer">
                  SMS
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push"
                  checked={channels.includes("push")}
                  onCheckedChange={() => handleChannelToggle("push")}
                />
                <label htmlFor="push" className="text-sm cursor-pointer">
                  Push
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variables">
              Variables disponibles
              <span className="text-sm text-muted-foreground ml-2">
                (separadas por comas)
              </span>
            </Label>
            <Input
              id="variables"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder="name, email, phone, amount"
            />
            <p className="text-xs text-muted-foreground">
              Usa estas variables en tus plantillas como: {`{{name}}, {{email}}`}, etc.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenido de la plantilla</CardTitle>
          <CardDescription>
            Configura el contenido para cada canal seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={channels[0] || "email"}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" disabled={!channels.includes("email")}>
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" disabled={!channels.includes("sms")}>
                SMS
              </TabsTrigger>
              <TabsTrigger value="push" disabled={!channels.includes("push")}>
                Push
              </TabsTrigger>
            </TabsList>

            {channels.includes("email") && (
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Asunto *</Label>
                  <Input
                    id="email-subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Ej: Bienvenido {{name}}"
                    required={channels.includes("email")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-html">Cuerpo HTML *</Label>
                  <Textarea
                    id="email-html"
                    value={emailHtmlBody}
                    onChange={(e) => setEmailHtmlBody(e.target.value)}
                    placeholder="<h1>Hola {{name}}</h1><p>Gracias por registrarte...</p>"
                    rows={8}
                    required={channels.includes("email")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-text">Cuerpo de texto plano (opcional)</Label>
                  <Textarea
                    id="email-text"
                    value={emailTextBody}
                    onChange={(e) => setEmailTextBody(e.target.value)}
                    placeholder="Hola {{name}}, Gracias por registrarte..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            )}

            {channels.includes("sms") && (
              <TabsContent value="sms" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-body">
                    Mensaje SMS * <span className="text-sm text-muted-foreground">(máx. 160 caracteres)</span>
                  </Label>
                  <Textarea
                    id="sms-body"
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    placeholder="Hola {{name}}, gracias por tu compra!"
                    rows={3}
                    maxLength={160}
                    required={channels.includes("sms")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {smsBody.length}/160 caracteres
                  </p>
                </div>
              </TabsContent>
            )}

            {channels.includes("push") && (
              <TabsContent value="push" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="push-title">Título *</Label>
                  <Input
                    id="push-title"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="Ej: Nueva promoción"
                    required={channels.includes("push")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="push-body">Mensaje *</Label>
                  <Textarea
                    id="push-body"
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="Hola {{name}}, tenemos una oferta especial para ti!"
                    rows={3}
                    required={channels.includes("push")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="push-icon">URL del ícono (opcional)</Label>
                  <Input
                    id="push-icon"
                    value={pushIcon}
                    onChange={(e) => setPushIcon(e.target.value)}
                    placeholder="https://ejemplo.com/icon.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="push-action">Acción al hacer clic (opcional)</Label>
                  <Input
                    id="push-action"
                    value={pushClickAction}
                    onChange={(e) => setPushClickAction(e.target.value)}
                    placeholder="/promotions/summer-sale"
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear plantilla"}
        </Button>
      </div>
    </form>
  );
}
