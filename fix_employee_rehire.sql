-- ==============================================================================
-- FIX: Link Employee to Existing Auth User on Insert
-- ==============================================================================
-- This script ensures that when you add an employee (via Dashboard)
-- who ALREADY has an account (auth.users), they are automatically linked.
-- This solves the issue of re-hiring an employee after deletion.

-- 1. Create the Trigger Function
CREATE OR REPLACE FUNCTION public.link_employee_to_existing_user()
RETURNS trigger AS $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Check if a user with this email already exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = NEW.email;

  -- If found, link them immediately
  IF existing_user_id IS NOT NULL THEN
    NEW.auth_id := existing_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger on employees table
DROP TRIGGER IF EXISTS before_insert_employee_link_auth ON public.employees;

CREATE TRIGGER before_insert_employee_link_auth
BEFORE INSERT ON public.employees
FOR EACH ROW EXECUTE PROCEDURE public.link_employee_to_existing_user();
