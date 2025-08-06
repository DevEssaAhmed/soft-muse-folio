-- Create contacts table for contact form submissions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  other_purpose TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'replied'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Contacts are publicly writable" 
ON public.contacts 
FOR INSERT 
USING (true);

CREATE POLICY "Anyone can manage contacts" 
ON public.contacts 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates on contacts
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);