-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('pending', 'completed', 'cancelled');

-- Create enum for payment method
CREATE TYPE public.payment_method AS ENUM ('cash', 'pix', 'credit_card', 'debit_card');

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  promotional_price DECIMAL(10,2) NOT NULL,
  valid_until DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_entries table
CREATE TABLE public.financial_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for services and promotions (for the public website)
CREATE POLICY "Services are publicly readable" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Active promotions are publicly readable" ON public.promotions
  FOR SELECT USING (true);

-- Appointments can be created by anyone (public booking form)
CREATE POLICY "Anyone can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- Authenticated users can read all appointments
CREATE POLICY "Authenticated users can read appointments" ON public.appointments
  FOR SELECT TO authenticated USING (true);

-- Authenticated users can update appointments
CREATE POLICY "Authenticated users can update appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (true);

-- Authenticated users can delete appointments
CREATE POLICY "Authenticated users can delete appointments" ON public.appointments
  FOR DELETE TO authenticated USING (true);

-- Authenticated users can manage services
CREATE POLICY "Authenticated users can insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update services" ON public.services
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete services" ON public.services
  FOR DELETE TO authenticated USING (true);

-- Authenticated users can manage promotions
CREATE POLICY "Authenticated users can insert promotions" ON public.promotions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update promotions" ON public.promotions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete promotions" ON public.promotions
  FOR DELETE TO authenticated USING (true);

-- Authenticated users can manage financial entries
CREATE POLICY "Authenticated users can read financial entries" ON public.financial_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert financial entries" ON public.financial_entries
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update financial entries" ON public.financial_entries
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete financial entries" ON public.financial_entries
  FOR DELETE TO authenticated USING (true);

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services
INSERT INTO public.services (name, description, price, duration) VALUES
  ('Bronze Artificial', 'Bronze instantâneo com resultado natural e duradouro. Técnica profissional com produtos de alta qualidade.', 120.00, 45),
  ('Bronze Natural', 'Preparação da pele para bronzeamento natural com proteção UV. Ideal para exposição solar controlada.', 80.00, 30),
  ('Pacote Bronze VIP', 'Combo especial: Bronze artificial + hidratação + manutenção. Resultado perfeito por mais tempo.', 200.00, 90);