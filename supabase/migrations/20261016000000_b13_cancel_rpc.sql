CREATE OR REPLACE FUNCTION cancel_adaptation(p_adaptation_id UUID)
RETURNS VOID AS $$
DECLARE
    v_requested_by UUID;
BEGIN
    SELECT requested_by INTO v_requested_by FROM adaptations WHERE id = p_adaptation_id;
    
    -- Only allow if the user is the requester (or if you are admin, but we just check requester here)
    IF v_requested_by = auth.uid() THEN
        UPDATE adaptations SET status = 'failed' WHERE id = p_adaptation_id AND status = 'pending';
        UPDATE jobs SET status = 'failed', error = 'Cancelled by user' WHERE ref_id = p_adaptation_id AND status = 'queued';
    ELSE
        RAISE EXCEPTION 'Not authorized to cancel this adaptation';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
