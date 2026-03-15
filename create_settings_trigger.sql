-- Trigger function to create company_settings on user signup
-- This captures the metadata passed during supabase.auth.signUp
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.company_settings (
    user_id,
    name,
    stripe_customer_id,
    subscription_status,
    subscription_plan
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'),
    NEW.raw_user_meta_data->>'stripe_customer_id',
    COALESCE(NEW.raw_user_meta_data->>'subscription_status', 'trialing'),
    COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'monthly')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();
