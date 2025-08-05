"use client";

import * as React from "react";
import { X, Mail, Plus, Loader2, Send, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { sendEmail, SendEmailDto } from "@/services/email/email.service";

interface EmailSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailSent?: (result: any) => void;
  // Pre-populated data
  defaultRecipients?: string[];
  defaultSubject?: string;
  defaultMessage?: string;
  // Email type configuration
  emailType?: SendEmailDto['emailType'];
  recipientName?: string;
  // Additional email data
  quoteNumber?: string;
  orderNumber?: string;
  purchaseOrderNumber?: string;
  // Context information
  contextTitle?: string;
  contextSubtitle?: string;
}

interface EmailFormData {
  recipients: string[];
  subject: string;
  message: string;
  emailType: SendEmailDto['emailType'];
}

const EMAIL_TEMPLATES = {
  'quote-approval': {
    subject: 'Quote Approval Required - {number}',
    message: `Dear {name},

Please review and approve the attached quote.

Quote Number: {number}
Date: {date}

You can view and approve this quote using the link that will be provided.

Best regards,
The Sales Team`
  },
  'quote-declined': {
    subject: 'Quote Declined - {number}',
    message: `Dear Team,

The quote {number} has been declined by the customer.

Reason: {reason}

Please review and follow up as necessary.

Best regards,
Sales Team`
  },
  'quote-accepted': {
    subject: 'Quote Accepted - {number}',
    message: `Dear Team,

Great news! Quote {number} has been accepted by the customer.

Total Amount: {total}

Please proceed with the order processing.

Best regards,
Sales Team`
  },
  'customer-quote-status': {
    subject: 'Purchase Order Update - {number}',
    message: `Dear {name},

We wanted to update you on your purchase order.

PO Number: {number}
Date: {date}

If you have any questions, please don't hesitate to contact us.

Best regards,
Customer Service Team`
  }
} as const;

export function EmailSendDialog({
  open,
  onOpenChange,
  onEmailSent,
  defaultRecipients = [],
  defaultSubject = '',
  defaultMessage = '',
  emailType = 'customer-quote-status',
  recipientName = 'Customer',
  quoteNumber = '',
  orderNumber = '',
  purchaseOrderNumber = '',
  contextTitle = 'Send Email',
  contextSubtitle = '',
}: EmailSendDialogProps) {
  const [formData, setFormData] = React.useState<EmailFormData>({
    recipients: [],
    subject: '',
    message: '',
    emailType: emailType,
  });
  const [newRecipient, setNewRecipient] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Memoize template data to prevent re-computation
  const templateData = React.useMemo(() => {
    const template = EMAIL_TEMPLATES[emailType];
    const contextNumber = quoteNumber || orderNumber || purchaseOrderNumber || 'N/A';
    
    return {
      subject: defaultSubject || template.subject.replace('{number}', contextNumber),
      message: defaultMessage || template.message
        .replace('{name}', recipientName)
        .replace('{number}', contextNumber)
        .replace('{date}', new Date().toLocaleDateString())
        .replace('{total}', '$0.00')
        .replace('{status}', 'Updated')
        .replace('{reason}', ''),
    };
  }, [emailType, quoteNumber, orderNumber, purchaseOrderNumber, defaultSubject, defaultMessage, recipientName]);

  // Initialize form data when dialog opens - Fixed dependency array
  React.useEffect(() => {
    if (open) {
      setFormData({
        recipients: defaultRecipients.length > 0 ? [...defaultRecipients] : [],
        subject: templateData.subject,
        message: templateData.message,
        emailType: emailType,
      });
      setNewRecipient('');
    }
  }, [open]); // Removed problematic dependencies

  // Separate effect for updating data when template changes (only when dialog is open)
  React.useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        subject: templateData.subject,
        message: templateData.message,
      }));
    }
  }, [templateData, open]);

  const isValidEmail = React.useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleAddRecipient = React.useCallback(() => {
    if (!newRecipient.trim()) return;

    if (!isValidEmail(newRecipient)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.recipients.includes(newRecipient)) {
      toast.error("Email already added");
      return;
    }

    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient]
    }));
    setNewRecipient('');
  }, [newRecipient, formData.recipients, isValidEmail]);

  const handleRemoveRecipient = React.useCallback((emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(email => email !== emailToRemove)
    }));
  }, []);

  const handleKeyPress = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  }, [handleAddRecipient]);

  const handleEmailTypeChange = React.useCallback((newEmailType: SendEmailDto['emailType']) => {
    const template = EMAIL_TEMPLATES[newEmailType];
    const contextNumber = quoteNumber || orderNumber || purchaseOrderNumber || 'N/A';
    
    setFormData(prev => ({
      ...prev,
      emailType: newEmailType,
      subject: template.subject.replace('{number}', contextNumber),
      message: template.message
        .replace('{name}', recipientName)
        .replace('{number}', contextNumber)
        .replace('{date}', new Date().toLocaleDateString())
        .replace('{total}', '$0.00')
        .replace('{status}', 'Updated')
        .replace('{reason}', ''),
    }));
  }, [quoteNumber, orderNumber, purchaseOrderNumber, recipientName]);

  const handleSend = React.useCallback(async () => {
    if (formData.recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsLoading(true);

      const emailData: SendEmailDto = {
        to: formData.recipients,
        name: recipientName,
        emailType: formData.emailType,
        quoteNumber: quoteNumber || undefined,
        quoteDate: new Date().toLocaleDateString(),
      };

      const result = await sendEmail(emailData);

      toast.success(
        `Email sent successfully to ${result.totalSent || formData.recipients.length} recipient(s)`
      );

      if (onEmailSent) {
        onEmailSent(result);
      }

      handleClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  }, [formData, recipientName, quoteNumber, onEmailSent]);

  const handleClose = React.useCallback(() => {
    setFormData({
      recipients: [],
      subject: '',
      message: '',
      emailType: 'customer-quote-status',
    });
    setNewRecipient('');
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {contextTitle}
          </DialogTitle>
          {contextSubtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {contextSubtitle}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Context Information */}
          {(quoteNumber || orderNumber || purchaseOrderNumber) && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Reference:</strong> {quoteNumber || orderNumber || purchaseOrderNumber}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Recipient:</strong> {recipientName}
              </p>
            </div>
          )}

          {/* Email Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="email-type" className="text-sm font-medium">
              Email Type
            </Label>
            <Select value={formData.emailType} onValueChange={handleEmailTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quote-approval">Quote Approval</SelectItem>
                <SelectItem value="quote-declined">Quote Declined</SelectItem>
                <SelectItem value="quote-accepted">Quote Accepted</SelectItem>
                <SelectItem value="customer-quote-status">Purchase Order Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="email-recipients" className="text-sm font-medium">
              <Users className="inline h-4 w-4 mr-1" />
              Recipients
            </Label>
            
            {/* Selected Recipients */}
            {formData.recipients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.recipients.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-xs">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(email)}
                      className="ml-1 hover:text-red-500 focus:outline-none"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Recipient */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRecipient}
                disabled={!newRecipient.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="email-subject" className="text-sm font-medium">
              Subject
            </Label>
            <Input
              id="email-subject"
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="email-message" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="email-message"
              placeholder="Enter your message..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="min-h-[120px] resize-y"
            />
          </div>

          {/* Email Preview Note */}
          <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
            <strong>Note:</strong> This email will be sent using the selected template. 
            The actual email content may include additional formatting and system-generated content.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={formData.recipients.length === 0 || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
