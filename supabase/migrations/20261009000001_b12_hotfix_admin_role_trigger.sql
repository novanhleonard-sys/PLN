CREATE OR REPLACE FUNCTION protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role to change roles
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow postgres (superuser) to change roles
  IF current_setting('role', true) = 'postgres' THEN
    RETURN NEW;
  END IF;

  -- Otherwise, prevent changing role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
