CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  event_date DATE NOT NULL,
  package TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a reservation"
ON public.reservations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can check availability"
ON public.reservations FOR SELECT
TO anon, authenticated
USING (true);